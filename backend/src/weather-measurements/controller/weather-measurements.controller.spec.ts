import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsController } from './weather-measurements.controller';
import { WeatherMeasurementsService } from '../service/weather-measurements.service';
import { WeatherMeasurementsPeriod } from '../dto/weather-measurements-period.enum';
import { WeatherMeasurementType } from '../dto/weather-measurment-type.enum';
import { ExportScope } from '../dto/export-scope.enum';
import { Subject } from 'rxjs';
import { WeatherMeasurementsEventsService } from '../service/weather-measurements-events.service';
import { Request, Response } from 'express';

const mockWeatherMeasurementsService = {
    getWeatherMeasurements: jest.fn(),
    getLatestWeatherMeasurement: jest.fn(),
    getAggregatedWeatherMeasurements: jest.fn(),
    getExportRows: jest.fn(),
};

let measurementCreated$: Subject<{ date: string }>;
const mockWeatherMeasurementsEventsService = {
    get measurementCreated$() {
        return measurementCreated$;
    },
};

const mockCsvStream = {
    pipe: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
};

jest.mock('@fast-csv/format', () => ({
    format: jest.fn(() => mockCsvStream),
}));

describe('WeatherMeasurementsController', () => {
    let controller: WeatherMeasurementsController;

    beforeEach(async () => {
        jest.clearAllMocks();
        measurementCreated$ = new Subject<{ date: string }>();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WeatherMeasurementsController],
            providers: [
                {
                    provide: WeatherMeasurementsService,
                    useValue: mockWeatherMeasurementsService,
                },
                {
                    provide: WeatherMeasurementsEventsService,
                    useValue: mockWeatherMeasurementsEventsService,
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

    it('getWeatherMeasurements should call service with period and type', async () => {
        const query = {
            period: WeatherMeasurementsPeriod.Day,
            type: WeatherMeasurementType.Temperature,
        };
        await controller.getWeatherMeasurements(query);
        expect(
            mockWeatherMeasurementsService.getWeatherMeasurements,
        ).toHaveBeenCalledWith(query.period, query.type);
    });

    it('getAggregatedWeatherMeasurements should call service with custom range', async () => {
        const query = {
            from: '2026-01-01T00:00:00.000Z',
            to: '2026-01-02T00:00:00.000Z',
            type: WeatherMeasurementType.Humidity,
        };
        await controller.getAggregatedWeatherMeasurements(query);
        expect(
            mockWeatherMeasurementsService.getAggregatedWeatherMeasurements,
        ).toHaveBeenCalledWith({
            from: new Date(query.from),
            to: new Date(query.to),
            type: query.type,
        });
    });

    it('getAggregatedWeatherMeasurements should call service with period', async () => {
        const query = {
            period: WeatherMeasurementsPeriod.Week,
            type: WeatherMeasurementType.Humidity,
        };
        await controller.getAggregatedWeatherMeasurements(query);
        expect(
            mockWeatherMeasurementsService.getAggregatedWeatherMeasurements,
        ).toHaveBeenCalledWith({
            period: query.period,
            type: query.type,
        });
    });

    it('getLatestWeatherMeasurement should call service', async () => {
        await controller.getLatestWeatherMeasurement();
        expect(
            mockWeatherMeasurementsService.getLatestWeatherMeasurement,
        ).toHaveBeenCalled();
    });

    it('streamMeasurements should set SSE headers and write events', () => {
        jest.useFakeTimers();
        const closeHandlers: Array<() => void> = [];
        const req = {
            on: jest.fn((event: string, handler: () => void) => {
                if (event === 'close') closeHandlers.push(handler);
            }),
        } as unknown as Request;
        const res = {
            setHeader: jest.fn(),
            flushHeaders: jest.fn(),
            write: jest.fn(),
            end: jest.fn(),
        } as unknown as Response;

        controller.streamMeasurements(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'text/event-stream',
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            'Cache-Control',
            'no-cache, no-transform',
        );
        expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
        expect(res.flushHeaders).toHaveBeenCalled();
        expect(res.write).toHaveBeenCalledWith(': connected\n\n');

        jest.advanceTimersByTime(15000);
        expect(res.write).toHaveBeenCalledWith(': ping\n\n');

        measurementCreated$.next({ date: '2026-01-01T00:00:00.000Z' });
        expect(res.write).toHaveBeenCalledWith('event: measurement\n');
        expect(res.write).toHaveBeenCalledWith(
            'data: {"date":"2026-01-01T00:00:00.000Z"}\n\n',
        );

        closeHandlers.forEach((handler) => handler());
        expect(res.end).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('exportWeatherMeasurements should write csv response', async () => {
        mockWeatherMeasurementsService.getExportRows.mockResolvedValue([
            { date: '2026-01-01T00:00:00.000Z', temperature: 10.5 },
        ]);
        const query = {
            period: WeatherMeasurementsPeriod.Day,
            scope: ExportScope.Selected,
            type: WeatherMeasurementType.Temperature,
        };
        const res = {
            setHeader: jest.fn(),
        } as unknown as Response;
        await controller.exportWeatherMeasurements(query, res);

        expect(
            mockWeatherMeasurementsService.getExportRows,
        ).toHaveBeenCalledWith(query);
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Type',
            'text/csv; charset=utf-8',
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            'attachment; filename="weather-measurements.csv"',
        );
        expect(mockCsvStream.pipe).toHaveBeenCalledWith(res);
        expect(mockCsvStream.write).toHaveBeenCalledWith({
            date: '2026-01-01T00:00:00.000Z',
            temperature: 10.5,
        });
        expect(mockCsvStream.end).toHaveBeenCalled();
    });

    it('exportWeatherMeasurements should normalize Date values and move date to the end', async () => {
        mockWeatherMeasurementsService.getExportRows.mockResolvedValue([
            {
                date: new Date('2026-01-01T00:00:00.000Z'),
                temperature: 12.3,
                capturedAt: new Date('2026-01-01T00:10:00.000Z'),
            },
        ]);
        const query = {
            period: WeatherMeasurementsPeriod.Day,
            scope: ExportScope.All,
        };
        const res = {
            setHeader: jest.fn(),
        } as unknown as Response;

        await controller.exportWeatherMeasurements(query, res);

        const writeArg = mockCsvStream.write.mock.calls[0][0];
        expect(writeArg).toEqual({
            temperature: 12.3,
            capturedAt: '2026-01-01T00:10:00.000Z',
            date: '2026-01-01T00:00:00.000Z',
        });
    });

    it('normalizeDateValues should keep object shape when no date key exists', () => {
        const result = (
            controller as unknown as {
                normalizeDateValues: (row: object) => Record<string, unknown>;
            }
        ).normalizeDateValues({
            temperature: 10.5,
            humidity: 44,
        });

        expect(result).toEqual({ temperature: 10.5, humidity: 44 });
    });
});
