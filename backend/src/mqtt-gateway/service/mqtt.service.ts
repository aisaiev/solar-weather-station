import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { connect, MqttClient } from 'mqtt';
import { EnvironmentVariables } from 'src/config/app-config.consts';
import { SensorsDataService } from 'src/sensors-data/service/sensors-data.service';
import { validate } from 'class-validator';
import { SensorsDataMqttInput } from 'src/mqtt-gateway/models/sensors-data-mqtt-input.model';

@Injectable({})
export class MqttService implements OnModuleInit {
  private logger = new Logger(MqttService.name);
  private mqttClient: MqttClient;

  get mqttClientConnected(): boolean {
    return this.mqttClient.connected;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly sensorsDataService: SensorsDataService,
  ) {}

  onModuleInit(): void {
    const host = this.configService.get<string>(EnvironmentVariables.MQTT_HOST);
    const port = this.configService.get<number>(EnvironmentVariables.MQTT_PORT);
    const username = this.configService.get<string>(
      EnvironmentVariables.MQTT_USER,
    );
    const password = this.configService.get<string>(
      EnvironmentVariables.MQTT_PASSWORD,
    );
    const topic = this.configService.get<string>(
      EnvironmentVariables.MQTT_TOPIC,
    );

    this.mqttClient = connect({
      host,
      port,
      username,
      password,
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

        const payloadData = new SensorsDataMqttInput(
          JSON.parse(payload.toString()),
        );

        validate(payloadData).then((errors) => {
          if (!errors.length) {
            const data: Prisma.SensorsDataCreateInput = {
              ...payloadData,
              date: new Date(),
            };
            this.sensorsDataService.createSensorsData(data);
          } else {
            this.logger.error('Incorrect sensors data received over MQTT');
          }
        });
      }
    });
  }
}
