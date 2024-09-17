import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsService } from './weather-measurements.service';

describe('WeatherMeasurementsService', () => {
    let service: WeatherMeasurementsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WeatherMeasurementsService],
        }).compile();

        service = module.get<WeatherMeasurementsService>(
            WeatherMeasurementsService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
