import { Test, TestingModule } from '@nestjs/testing';
import { MqttService } from './mqtt.service';
import { ConfigService } from '@nestjs/config';
import { WeatherMeasurementsService } from 'src/weather-measurements/service/weather-measurements.service';

const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-value'),
    getOrThrow: jest.fn().mockReturnValue('mock-value'),
};

const mockWeatherMeasurementsService = {
    createWeatherMeasurement: jest.fn().mockResolvedValue(undefined),
};

describe('MqttService', () => {
    let service: MqttService;

    beforeEach(async () => {
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
});
