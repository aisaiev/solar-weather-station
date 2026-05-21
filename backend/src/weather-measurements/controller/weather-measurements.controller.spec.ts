import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsController } from './weather-measurements.controller';
import { WeatherMeasurementsService } from '../service/weather-measurements.service';

const mockWeatherMeasurementsService = {
    getWeatherMeasurements: jest.fn().mockResolvedValue([]),
    getLatestWeatherMeasurements: jest.fn().mockResolvedValue(null),
    getAggregatedWeatherMeasurements: jest.fn().mockResolvedValue([]),
};

describe('WeatherMeasurementsController', () => {
    let controller: WeatherMeasurementsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WeatherMeasurementsController],
            providers: [
                {
                    provide: WeatherMeasurementsService,
                    useValue: mockWeatherMeasurementsService,
                },
            ],
        }).compile();

        controller = module.get<WeatherMeasurementsController>(
            WeatherMeasurementsController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
