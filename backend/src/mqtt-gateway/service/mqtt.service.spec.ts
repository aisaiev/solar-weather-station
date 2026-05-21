import { Test, TestingModule } from '@nestjs/testing';
import { MqttService } from './mqtt.service';
import { ConfigService } from '@nestjs/config';
import { WeatherMeasurementsService } from 'src/weather-measurements/service/weather-measurements.service';
import { EnvironmentVariables } from 'src/config/app-config.consts';

jest.mock('mqtt');
import * as mqtt from 'mqtt';

const mockSubscribe = jest.fn();
const mockMqttClient = {
    on: jest.fn(),
    subscribe: mockSubscribe,
};

const mockConfigService = {
    get: jest.fn((key: string) => {
        const config: Record<string, string | number> = {
            [EnvironmentVariables.MQTT_ENABLED]: 'true',
            [EnvironmentVariables.MQTT_HOST]: 'localhost',
            [EnvironmentVariables.MQTT_PORT]: 1883,
            [EnvironmentVariables.MQTT_TOPIC]: 'weather/data',
        };
        return config[key];
    }),
    getOrThrow: jest.fn().mockReturnValue('mock-value'),
};

const mockWeatherMeasurementsService = {
    createWeatherMeasurement: jest.fn().mockResolvedValue(undefined),
};

describe('MqttService', () => {
    let service: MqttService;

    beforeEach(async () => {
        jest.clearAllMocks();
        (mqtt.connect as jest.Mock).mockReturnValue(mockMqttClient);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MqttService,
                { provide: ConfigService, useValue: mockConfigService },
                {
                    provide: WeatherMeasurementsService,
                    useValue: mockWeatherMeasurementsService,
                },
            ],
        }).compile();

        service = module.get<MqttService>(MqttService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to MQTT broker with host and port from config', () => {
            service.onModuleInit();

            expect(mqtt.connect).toHaveBeenCalledWith({
                host: 'localhost',
                port: 1883,
            });
        });

        it('should register connect, disconnect, and message event handlers', () => {
            service.onModuleInit();

            expect(mockMqttClient.on).toHaveBeenCalledWith(
                'connect',
                expect.any(Function),
            );
            expect(mockMqttClient.on).toHaveBeenCalledWith(
                'disconnect',
                expect.any(Function),
            );
            expect(mockMqttClient.on).toHaveBeenCalledWith(
                'message',
                expect.any(Function),
            );
        });

        it('should subscribe to the configured MQTT topic on connect', () => {
            service.onModuleInit();

            const connectHandler = (
                mockMqttClient.on.mock.calls as [string, () => void][]
            ).find(([event]) => event === 'connect')![1];
            connectHandler();

            expect(mockSubscribe).toHaveBeenCalledWith(
                'weather/data',
                expect.any(Function),
            );
        });

        describe('message handler', () => {
            let messageHandler: (
                topic: string,
                payload: Buffer,
                packet: { retain: boolean },
            ) => void;

            beforeEach(() => {
                service.onModuleInit();
                messageHandler = (
                    mockMqttClient.on.mock.calls as [
                        string,
                        typeof messageHandler,
                    ][]
                ).find(([event]) => event === 'message')![1];
            });

            it('should call createWeatherMeasurement for a valid non-retained message', async () => {
                const payload = {
                    temperature: 22.5,
                    humidity: 60,
                    pressure: 1013,
                };
                messageHandler(
                    'weather/data',
                    Buffer.from(JSON.stringify(payload)),
                    { retain: false },
                );

                await new Promise(process.nextTick);

                expect(
                    mockWeatherMeasurementsService.createWeatherMeasurement,
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        temperature: 22.5,
                        humidity: 60,
                        pressure: 1013,
                        date: expect.any(Date),
                    }),
                );
            });

            it('should ignore retained messages', async () => {
                messageHandler(
                    'weather/data',
                    Buffer.from(JSON.stringify({ temperature: 22.5 })),
                    { retain: true },
                );

                await new Promise(process.nextTick);

                expect(
                    mockWeatherMeasurementsService.createWeatherMeasurement,
                ).not.toHaveBeenCalled();
            });

            it('should not call createWeatherMeasurement when payload fails validation', async () => {
                // mcu must be a string, so passing a number should fail validation
                const invalidPayload = { mcu: 123 };
                messageHandler(
                    'weather/data',
                    Buffer.from(JSON.stringify(invalidPayload)),
                    { retain: false },
                );

                await new Promise(process.nextTick);

                expect(
                    mockWeatherMeasurementsService.createWeatherMeasurement,
                ).not.toHaveBeenCalled();
            });
        });
    });
});
