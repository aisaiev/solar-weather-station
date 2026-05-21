import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsService } from './weather-measurements.service';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { WeatherMeasurementsPeriod } from '../dto/weather-measurements-period.enum';
import { WeatherMeasurementType } from '../dto/weather-measurment-type.enum';

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

    describe('getWeatherMeasurements', () => {
        it('should delegate to getWeatherMeasurementsForDay when period is Day', async () => {
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

        it('should delegate to getWeatherMeasurementsForWeek when period is Week', async () => {
            await service.getWeatherMeasurements(
                WeatherMeasurementsPeriod.Week,
                WeatherMeasurementType.Humidity,
            );
            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: { humidity: true, date: true },
                }),
            );
        });

        it('should delegate to getWeatherMeasurementsForMonth when period is Month', async () => {
            await service.getWeatherMeasurements(
                WeatherMeasurementsPeriod.Month,
                WeatherMeasurementType.Pressure,
            );
            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: { pressure: true, date: true },
                }),
            );
        });
    });

    describe('getWeatherMeasurementsForDay', () => {
        it('should query with correct column and return results', async () => {
            const mockData = [{ temperature: 22.5, date: new Date() }];
            mockFindMany.mockResolvedValueOnce(mockData);

            const result = await service.getWeatherMeasurementsForDay(
                WeatherMeasurementType.Temperature,
            );

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: { temperature: true, date: true },
                }),
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('getWeatherMeasurementsForWeek', () => {
        it('should query with correct column and return results', async () => {
            const mockData = [{ humidity: 60, date: new Date() }];
            mockFindMany.mockResolvedValueOnce(mockData);

            const result = await service.getWeatherMeasurementsForWeek(
                WeatherMeasurementType.Humidity,
            );

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: { humidity: true, date: true },
                }),
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('getWeatherMeasurementsForMonth', () => {
        it('should query with correct column and return results', async () => {
            const mockData = [{ pressure: 1013, date: new Date() }];
            mockFindMany.mockResolvedValueOnce(mockData);

            const result = await service.getWeatherMeasurementsForMonth(
                WeatherMeasurementType.Pressure,
            );

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    columns: { pressure: true, date: true },
                }),
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('getAggregatedWeatherMeasurements', () => {
        it('should build full aggregation query chain and return results', async () => {
            const mockResults = [
                {
                    bucket: '2024-01-01T00:00:00Z',
                    avg: 22.5,
                    min: 20.0,
                    max: 25.0,
                },
            ];
            mockOrderBy.mockResolvedValueOnce(mockResults);

            const result = await service.getAggregatedWeatherMeasurements(
                WeatherMeasurementsPeriod.Day,
                WeatherMeasurementType.Temperature,
            );

            expect(mockSelect).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalled();
            expect(mockSelectWhere).toHaveBeenCalled();
            expect(mockGroupBy).toHaveBeenCalled();
            expect(mockOrderBy).toHaveBeenCalled();
            expect(result).toEqual(mockResults);
        });

        it.each([
            [WeatherMeasurementsPeriod.Day, WeatherMeasurementType.Temperature],
            [WeatherMeasurementsPeriod.Week, WeatherMeasurementType.Humidity],
            [WeatherMeasurementsPeriod.Month, WeatherMeasurementType.Pressure],
        ])(
            'should execute aggregation query for period %s and type %s',
            async (period, type) => {
                await service.getAggregatedWeatherMeasurements(period, type);
                expect(mockSelect).toHaveBeenCalled();
                expect(mockOrderBy).toHaveBeenCalled();
            },
        );
    });

    describe('getLatestWeatherMeasurement', () => {
        it('should query for most recent measurement excluding id', async () => {
            const mockMeasurement = {
                temperature: 22.5,
                humidity: 60,
                date: new Date(),
            };
            mockFindFirst.mockResolvedValueOnce(mockMeasurement);

            const result = await service.getLatestWeatherMeasurement();

            expect(mockFindFirst).toHaveBeenCalledWith(
                expect.objectContaining({ columns: { id: false } }),
            );
            expect(result).toEqual(mockMeasurement);
        });

        it('should return undefined when no measurements exist', async () => {
            mockFindFirst.mockResolvedValueOnce(undefined);

            const result = await service.getLatestWeatherMeasurement();

            expect(result).toBeUndefined();
        });
    });

    describe('createWeatherMeasurement', () => {
        it('should insert the measurement into the database', async () => {
            const measurement = {
                temperature: 22.5,
                humidity: 60,
                date: new Date(),
            };

            await service.createWeatherMeasurement(measurement);

            expect(mockInsert).toHaveBeenCalled();
            expect(mockInsertValues).toHaveBeenCalledWith(measurement);
        });
    });
});
