import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsController } from './weather-measurements.controller';

describe('WeatherMeasurementsController', () => {
    let controller: WeatherMeasurementsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WeatherMeasurementsController],
        }).compile();

        controller = module.get<WeatherMeasurementsController>(
            WeatherMeasurementsController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
