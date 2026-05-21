import { Test, TestingModule } from '@nestjs/testing';
import { WeatherMeasurementsController } from './weather-measurements.controller';
import { WeatherMeasurementsService } from '../service/weather-measurements.service';
import { WeatherMeasurementsPeriod } from '../dto/weather-measurements-period.enum';
import { WeatherMeasurementType } from '../dto/weather-measurment-type.enum';

const mockWeatherMeasurementsService = {
    getWeatherMeasurements: jest.fn(),
    getLatestWeatherMeasurement: jest.fn(),
    getAggregatedWeatherMeasurements: jest.fn(),
};

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

    describe('getWeatherMeasurements', () => {
        it('should call service with period and type and return results', async () => {
            const mockData = [{ temperature: 22.5, date: new Date() }];
            mockWeatherMeasurementsService.getWeatherMeasurements.mockResolvedValue(
                mockData,
            );

            const query = {
                period: WeatherMeasurementsPeriod.Day,
                type: WeatherMeasurementType.Temperature,
            };
            const result = await controller.getWeatherMeasurements(query);

            expect(
                mockWeatherMeasurementsService.getWeatherMeasurements,
            ).toHaveBeenCalledWith(
                WeatherMeasurementsPeriod.Day,
                WeatherMeasurementType.Temperature,
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('getAggregatedWeatherMeasurements', () => {
        it('should call service with period and type and return aggregated results', async () => {
            const mockData = [
                { bucket: '2024-01-01', avg: 22.5, min: 20.0, max: 25.0 },
            ];
            mockWeatherMeasurementsService.getAggregatedWeatherMeasurements.mockResolvedValue(
                mockData,
            );

            const query = {
                period: WeatherMeasurementsPeriod.Week,
                type: WeatherMeasurementType.Humidity,
            };
            const result =
                await controller.getAggregatedWeatherMeasurements(query);

            expect(
                mockWeatherMeasurementsService.getAggregatedWeatherMeasurements,
            ).toHaveBeenCalledWith(
                WeatherMeasurementsPeriod.Week,
                WeatherMeasurementType.Humidity,
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('getLatestWeatherMeasurement', () => {
        it('should call service and return the latest measurement', async () => {
            const mockData = {
                temperature: 22.5,
                humidity: 60,
                date: new Date(),
            };
            mockWeatherMeasurementsService.getLatestWeatherMeasurement.mockResolvedValue(
                mockData,
            );

            const result = await controller.getLatestWeatherMeasurement();

            expect(
                mockWeatherMeasurementsService.getLatestWeatherMeasurement,
            ).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });

        it('should return undefined when no measurements exist', async () => {
            mockWeatherMeasurementsService.getLatestWeatherMeasurement.mockResolvedValue(
                undefined,
            );

            const result = await controller.getLatestWeatherMeasurement();

            expect(result).toBeUndefined();
        });
    });
});
