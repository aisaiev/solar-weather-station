import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schema from '../schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, between, desc } from 'drizzle-orm';
import { WeatherMeasurementsPeriod } from '../dto/weather-measurements-period.enum';
import { WeatherMeasurementType } from '../dto/weather-measurment-type.enum';

@Injectable()
export class WeatherMeasurementsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly database: NodePgDatabase<typeof schema>,
    ) {}

    async getWeatherMeasurements(
        period: WeatherMeasurementsPeriod,
        type: WeatherMeasurementType,
    ) {
        switch (period) {
            case WeatherMeasurementsPeriod.Day:
                return this.getWeatherMeasurementsForDay(type);
            case WeatherMeasurementsPeriod.Week:
                return this.getWeatherMeasurementsForWeek(type);
            case WeatherMeasurementsPeriod.Month:
                return this.getWeatherMeasurementsForMonth(type);
        }
    }

    async getWeatherMeasurementsForDay(type: WeatherMeasurementType) {
        const from = new Date(new Date().setDate(new Date().getDate() - 1));
        const till = new Date();
        return this.database.query.weatherMeasurements.findMany({
            where: (measurements) => between(measurements.date, from, till),
            columns: {
                [type]: true,
                date: true,
            },
            orderBy: [asc(schema.weatherMeasurements.date)],
        });
    }

    async getWeatherMeasurementsForWeek(type: WeatherMeasurementType) {
        const from = new Date(new Date().setDate(new Date().getDate() - 7));
        const till = new Date();
        return this.database.query.weatherMeasurements.findMany({
            where: (measurements) => between(measurements.date, from, till),
            columns: {
                [type]: true,
                date: true,
            },
            orderBy: [asc(schema.weatherMeasurements.date)],
        });
    }

    async getWeatherMeasurementsForMonth(type: WeatherMeasurementType) {
        const from = new Date(new Date().setMonth(new Date().getMonth() - 1));
        const till = new Date();
        return this.database.query.weatherMeasurements.findMany({
            where: (measurements) => between(measurements.date, from, till),
            columns: {
                [type]: true,
                date: true,
            },
            orderBy: [asc(schema.weatherMeasurements.date)],
        });
    }

    async getLatestWeatherMeasurement() {
        return this.database.query.weatherMeasurements.findFirst({
            columns: {
                id: false,
            },
            orderBy: [desc(schema.weatherMeasurements.date)],
        });
    }

    async createWeatherMeasurement(
        weatherMeasurement: typeof schema.weatherMeasurements.$inferInsert,
    ) {
        await this.database
            .insert(schema.weatherMeasurements)
            .values(weatherMeasurement);
    }
}
