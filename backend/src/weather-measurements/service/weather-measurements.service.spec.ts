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
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
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

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getWeatherMeasurements should route to day/week/month handlers', async () => {
        const daySpy = jest
            .spyOn(service, 'getWeatherMeasurementsForDay')
            .mockResolvedValue([] as never);
        const weekSpy = jest
            .spyOn(service, 'getWeatherMeasurementsForWeek')
            .mockResolvedValue([] as never);
        const monthSpy = jest
            .spyOn(service, 'getWeatherMeasurementsForMonth')
            .mockResolvedValue([] as never);

        await service.getWeatherMeasurements(
            WeatherMeasurementsPeriod.Day,
            WeatherMeasurementType.Temperature,
        );
        await service.getWeatherMeasurements(
            WeatherMeasurementsPeriod.Week,
            WeatherMeasurementType.Temperature,
        );
        await service.getWeatherMeasurements(
            WeatherMeasurementsPeriod.Month,
            WeatherMeasurementType.Temperature,
        );

        expect(daySpy).toHaveBeenCalledWith(WeatherMeasurementType.Temperature);
        expect(weekSpy).toHaveBeenCalledWith(
            WeatherMeasurementType.Temperature,
        );
        expect(monthSpy).toHaveBeenCalledWith(
            WeatherMeasurementType.Temperature,
        );
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

    it('getAggregationConfig should produce expected period ranges and buckets', () => {
        const getAggregationConfig = (
            service as unknown as {
                getAggregationConfig: (period: WeatherMeasurementsPeriod) => {
                    from: Date;
                    bucketSeconds: number;
                };
            }
        ).getAggregationConfig.bind(service);

        const now = Date.now();
        const day = getAggregationConfig(WeatherMeasurementsPeriod.Day);
        const week = getAggregationConfig(WeatherMeasurementsPeriod.Week);
        const month = getAggregationConfig(WeatherMeasurementsPeriod.Month);

        expect(day.bucketSeconds).toBe(900);
        expect(week.bucketSeconds).toBe(3600);
        expect(month.bucketSeconds).toBe(21600);

        expect(now - day.from.getTime()).toBeCloseTo(24 * 60 * 60 * 1000, -4);
        expect(now - week.from.getTime()).toBeCloseTo(
            7 * 24 * 60 * 60 * 1000,
            -4,
        );
        expect(now - month.from.getTime()).toBeGreaterThan(
            27 * 24 * 60 * 60 * 1000,
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

    it('getAggregatedWeatherMeasurements should use custom from/to and dynamic bucket', async () => {
        const from = new Date('2026-01-01T00:00:00.000Z');
        const to = new Date('2026-01-04T00:00:00.000Z');
        const bucketSpy = jest.spyOn(
            service as unknown as {
                getBucketSecondsForRange: (from: Date, to: Date) => number;
            },
            'getBucketSecondsForRange',
        );

        await service.getAggregatedWeatherMeasurements({
            from,
            to,
            type: WeatherMeasurementType.Pressure,
        });

        expect(bucketSpy).toHaveBeenCalledWith(from, to);
        expect(mockSelectWhere).toHaveBeenCalled();
    });

    it('getExportRows should return raw selected rows for period', async () => {
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

    it('getExportRows should return raw all-sensors rows for period', async () => {
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

    it('getExportRows should use custom from/to for selected scope', async () => {
        const rows = [
            { date: new Date('2026-01-01T00:00:00.000Z'), humidity: 45 },
        ];
        mockFindMany.mockResolvedValueOnce(rows);

        const result = await service.getExportRows({
            from: '2026-01-01T00:00:00.000Z',
            to: '2026-01-02T00:00:00.000Z',
            scope: ExportScope.Selected,
            type: WeatherMeasurementType.Humidity,
        });

        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                columns: { date: true, humidity: true },
            }),
        );
        expect(result).toEqual(rows);
    });

    it('getBucketSecondsForRange should return bucket boundaries for range windows', () => {
        const getBucketSecondsForRange = (
            service as unknown as {
                getBucketSecondsForRange: (from: Date, to: Date) => number;
            }
        ).getBucketSecondsForRange.bind(service);

        const base = new Date('2026-01-01T00:00:00.000Z');
        expect(
            getBucketSecondsForRange(
                base,
                new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000),
            ),
        ).toBe(900);
        expect(
            getBucketSecondsForRange(
                base,
                new Date(base.getTime() + 14 * 24 * 60 * 60 * 1000),
            ),
        ).toBe(3600);
        expect(
            getBucketSecondsForRange(
                base,
                new Date(base.getTime() + 90 * 24 * 60 * 60 * 1000),
            ),
        ).toBe(21600);
        expect(
            getBucketSecondsForRange(
                base,
                new Date(base.getTime() + 91 * 24 * 60 * 60 * 1000),
            ),
        ).toBe(86400);
    });

    it('getDateRangeAndBucket should resolve period config and custom config', () => {
        const getDateRangeAndBucket = (
            service as unknown as {
                getDateRangeAndBucket: (params: unknown) => {
                    from: Date;
                    till: Date;
                    bucketSeconds: number;
                };
            }
        ).getDateRangeAndBucket.bind(service);

        const periodResult = getDateRangeAndBucket({
            period: WeatherMeasurementsPeriod.Day,
            type: WeatherMeasurementType.Temperature,
        });
        expect(periodResult.from).toBeInstanceOf(Date);
        expect(periodResult.till).toBeInstanceOf(Date);
        expect(periodResult.bucketSeconds).toBe(900);

        const from = new Date('2026-02-01T00:00:00.000Z');
        const to = new Date('2026-02-21T00:00:00.000Z');
        const customResult = getDateRangeAndBucket({
            from,
            to,
            type: WeatherMeasurementType.Temperature,
        });
        expect(customResult.from).toBe(from);
        expect(customResult.till).toBe(to);
        expect(customResult.bucketSeconds).toBe(21600);
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
