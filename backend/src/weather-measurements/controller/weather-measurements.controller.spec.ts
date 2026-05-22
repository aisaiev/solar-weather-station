import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsController } from './weather-measurements.controller';
import { WeatherMeasurementsService } from '../service/weather-measurements.service';
import { WeatherMeasurementsPeriod } from '../dto/weather-measurements-period.enum';
import { WeatherMeasurementType } from '../dto/weather-measurment-type.enum';
import { ExportScope } from '../dto/export-scope.enum';

const mockWeatherMeasurementsService = {
    getWeatherMeasurements: jest.fn(),
    getLatestWeatherMeasurement: jest.fn(),
    getAggregatedWeatherMeasurements: jest.fn(),
    getExportRows: jest.fn(),
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

    it('exportWeatherMeasurements should write csv response', async () => {
        mockWeatherMeasurementsService.getExportRows.mockResolvedValue([
            { date: '2026-01-01T00:00:00.000Z', temperature: 10.5 },
        ]);
        const query = {
            period: WeatherMeasurementsPeriod.Day,
            scope: ExportScope.Selected,
            type: WeatherMeasurementType.Temperature,
        };
        const res = { setHeader: jest.fn() } as any;
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
});
