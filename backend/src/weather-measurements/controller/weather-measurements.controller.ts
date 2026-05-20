import { Controller, Get, Query } from '@nestjs/common';
import { WeatherMeasurementsService } from '../service/weather-measurements.service';
import { GetWeatherMeasurementsQuery } from '../dto/get-weather-measurements.params';

@Controller('weather-measurements')
export class WeatherMeasurementsController {
    constructor(
        private readonly weatherMeasurementsService: WeatherMeasurementsService,
    ) {}

    @Get()
    async getWeatherMeasurements(@Query() query: GetWeatherMeasurementsQuery) {
        return this.weatherMeasurementsService.getWeatherMeasurements(
            query.period,
            query.type,
        );
    }

    @Get('aggregated')
    async getAggregatedWeatherMeasurements(
        @Query() query: GetWeatherMeasurementsQuery,
    ) {
        return this.weatherMeasurementsService.getAggregatedWeatherMeasurements(
            query.period,
            query.type,
        );
    }

    @Get('latest')
    async getLatestWeatherMeasurement() {
        return this.weatherMeasurementsService.getLatestWeatherMeasurement();
    }
}
