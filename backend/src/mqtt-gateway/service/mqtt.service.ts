import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';
import { EnvironmentVariables } from 'src/config/app-config.consts';
import { validate } from 'class-validator';
import { WeatherMeasurementsMqttDto } from '../models/weather-measuremets-mqtt.dto';
import { CreateWeatherMeasurementRequest } from 'src/weather-measurements/dto/create-weather-measurement.request';
import { WeatherMeasurementsService } from 'src/weather-measurements/service/weather-measurements.service';
import { WeatherMeasurementsEventsService } from 'src/weather-measurements/service/weather-measurements-events.service';

@Injectable({})
export class MqttService implements OnModuleInit {
    private logger = new Logger(MqttService.name);
    private mqttClient: MqttClient;

    constructor(
        private readonly configService: ConfigService,
        private readonly weatherMeasurementsService: WeatherMeasurementsService,
        private readonly weatherMeasurementsEventsService: WeatherMeasurementsEventsService,
    ) {}

    onModuleInit(): void {
        const enabled = this.configService.get<string>(
            EnvironmentVariables.MQTT_ENABLED,
        );
        if (enabled !== 'true') {
            this.logger.warn('MQTT is disabled, skipping connection');
            return;
        }

        const host = this.configService.get<string>(
            EnvironmentVariables.MQTT_HOST,
        );
        const port = this.configService.get<number>(
            EnvironmentVariables.MQTT_PORT,
        );
        const topic = this.configService.get<string>(
            EnvironmentVariables.MQTT_TOPIC,
        );

        this.mqttClient = connect({
            host,
            port,
        });

        this.mqttClient.on('connect', () => {
            this.logger.debug(`Connected to MQTT broker ${host}`);
            this.mqttClient.subscribe(topic, () => {
                this.logger.debug(`Subscribed to MQTT topic ${topic}`);
            });
        });

        this.mqttClient.on('disconnect', () => {
            this.logger.debug(`Disconnected from MQTT broker ${host}`);
        });

        this.mqttClient.on('message', (topic, payload, packet) => {
            if (!packet.retain) {
                this.logger.debug('Received data over MQTT');

                const payloadData = new WeatherMeasurementsMqttDto(
                    JSON.parse(payload.toString()),
                );

                validate(payloadData).then(async (errors) => {
                    if (!errors.length) {
                        const weatherMeasurement: CreateWeatherMeasurementRequest =
                            {
                                ...payloadData,
                                date: new Date(),
                            };
                        await this.weatherMeasurementsService.createWeatherMeasurement(
                            weatherMeasurement,
                        );
                        this.weatherMeasurementsEventsService.publishMeasurementCreated(
                            weatherMeasurement,
                        );
                    } else {
                        this.logger.error(
                            'Incorrect weather measurements received over MQTT',
                        );
                    }
                });
            }
        });
    }
}
