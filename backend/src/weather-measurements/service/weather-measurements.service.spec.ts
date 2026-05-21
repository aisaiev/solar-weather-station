import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsService } from './weather-measurements.service';
import { DATABASE_CONNECTION } from 'src/database/database-connection';

const mockDatabase = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
};

describe('WeatherMeasurementsService', () => {
    let service: WeatherMeasurementsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WeatherMeasurementsService,
                { provide: DATABASE_CONNECTION, useValue: mockDatabase },
            ],
        }).compile();

        service = module.get<WeatherMeasurementsService>(
            WeatherMeasurementsService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
