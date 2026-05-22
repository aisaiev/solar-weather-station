import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsService } from './weather-measurements.service';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { WeatherMeasurementsPeriod } from '../dto/weather-measurements-period.enum';
import { WeatherMeasurementType } from '../dto/weather-measurment-type.enum';
import { ExportScope } from '../dto/export-scope.enum';

const mockFindMany = jest.fn().mockResolvedValue([]);
const mockFindFirst = jest.fn().mockResolvedValue(null);
const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });
const mockOrderBy = jest.fn().mockResolvedValue([]);
const mockGroupBy = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
const mockSelectWhere = jest.fn().mockReturnValue({ groupBy: mockGroupBy });
const mockFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

const mockDatabase = {
    select: mockSelect,
    insert: mockInsert,
    query: {
        weatherMeasurements: {
            findMany: mockFindMany,
            findFirst: mockFindFirst,
        },
    },
};

describe('WeatherMeasurementsService', () => {
    let service: WeatherMeasurementsService;

    beforeEach(async () => {
        jest.clearAllMocks();
        mockOrderBy.mockResolvedValue([]);
        mockFindMany.mockResolvedValue([]);
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

    it('getWeatherMeasurements should request selected sensor column', async () => {
        await service.getWeatherMeasurements(
            WeatherMeasurementsPeriod.Day,
            WeatherMeasurementType.Temperature,
        );
        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                columns: { temperature: true, date: true },
            }),
        );
    });

    it('getAggregatedWeatherMeasurements should run select/group/order chain', async () => {
        await service.getAggregatedWeatherMeasurements({
            period: WeatherMeasurementsPeriod.Week,
            type: WeatherMeasurementType.Humidity,
        });
        expect(mockSelect).toHaveBeenCalled();
        expect(mockFrom).toHaveBeenCalled();
        expect(mockSelectWhere).toHaveBeenCalled();
        expect(mockGroupBy).toHaveBeenCalled();
        expect(mockOrderBy).toHaveBeenCalled();
    });

    it('getExportRows should return raw selected rows', async () => {
        const rows = [{ date: new Date(), temperature: 12.4 }];
        mockFindMany.mockResolvedValueOnce(rows);

        const result = await service.getExportRows({
            period: WeatherMeasurementsPeriod.Day,
            scope: ExportScope.Selected,
            type: WeatherMeasurementType.Temperature,
        });

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                columns: { date: true, temperature: true },
            }),
        );
        expect(result).toEqual(rows);
    });

    it('getExportRows should return raw all-sensors rows', async () => {
        const rows = [{ date: new Date(), temperature: 12.4, humidity: 50 }];
        mockFindMany.mockResolvedValueOnce(rows);

        const result = await service.getExportRows({
            period: WeatherMeasurementsPeriod.Day,
            scope: ExportScope.All,
        });

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                columns: expect.objectContaining({
                    date: true,
                    temperature: true,
                    humidity: true,
                    pressure: true,
                }),
            }),
        );
        expect(result).toEqual(rows);
    });

    it('getLatestWeatherMeasurement should query without id', async () => {
        await service.getLatestWeatherMeasurement();
        expect(mockFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({ columns: { id: false } }),
        );
    });

    it('createWeatherMeasurement should insert measurement', async () => {
        const measurement = { temperature: 22.5, date: new Date() };
        await service.createWeatherMeasurement(measurement);
        expect(mockInsert).toHaveBeenCalled();
        expect(mockInsertValues).toHaveBeenCalledWith(measurement);
    });
});
