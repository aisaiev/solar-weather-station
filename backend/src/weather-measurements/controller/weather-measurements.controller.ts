import { Controller, Get, Query, Res } from '@nestjs/common';
import { WeatherMeasurementsService } from '../service/weather-measurements.service';
import { GetWeatherMeasurementsQuery } from '../dto/get-weather-measurements.params';
import { ExportWeatherMeasurementsQuery } from '../dto/export-weather-measurements.params';
import { Response } from 'express';
import { format } from '@fast-csv/format';

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
        if (query.from && query.to) {
            return this.weatherMeasurementsService.getAggregatedWeatherMeasurements(
                {
                    from: new Date(query.from),
                    to: new Date(query.to),
                    type: query.type,
                },
            );
        }
        return this.weatherMeasurementsService.getAggregatedWeatherMeasurements(
            { period: query.period!, type: query.type },
        );
    }

    @Get('latest')
    async getLatestWeatherMeasurement() {
        return this.weatherMeasurementsService.getLatestWeatherMeasurement();
    }

    @Get('export')
    async exportWeatherMeasurements(
        @Query() query: ExportWeatherMeasurementsQuery,
        @Res() res: Response,
    ) {
        const rows = await this.weatherMeasurementsService.getExportRows(query);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="weather-measurements.csv"',
        );
        const csvStream = format({ headers: true });
        csvStream.pipe(res);
        for (const row of rows) {
            csvStream.write(this.normalizeDateValues(row));
        }
        csvStream.end();
    }

    private normalizeDateValues(row: object): Record<string, unknown> {
        const entries = Object.entries(row).map(([key, value]) => [
            key,
            value instanceof Date ? value.toISOString() : value,
        ]);
        const dateEntry = entries.find(([key]) => key === 'date');
        const otherEntries = entries.filter(([key]) => key !== 'date');

        if (!dateEntry) {
            return Object.fromEntries(otherEntries);
        }

        return Object.fromEntries([...otherEntries, dateEntry]);
    }
}
