import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schema from '../schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { asc, between, desc, sql } from 'drizzle-orm';
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

    async getAggregatedWeatherMeasurements(
        params:
            | { period: WeatherMeasurementsPeriod }
            | { from: Date; to: Date },
        type: WeatherMeasurementType,
    ) {
        let from: Date;
        let till: Date;
        let bucketSeconds: number;

        if ('period' in params) {
            const config = this.getAggregationConfig(params.period);
            from = config.from;
            till = new Date();
            bucketSeconds = config.bucketSeconds;
        } else {
            from = params.from;
            till = params.to;
            bucketSeconds = this.getBucketSecondsForRange(from, till);
        }

        const sensorColumns = {
            [WeatherMeasurementType.Temperature]:
                schema.weatherMeasurements.temperature,
            [WeatherMeasurementType.Humidity]:
                schema.weatherMeasurements.humidity,
            [WeatherMeasurementType.Pressure]:
                schema.weatherMeasurements.pressure,
            [WeatherMeasurementType.InternalTemperature]:
                schema.weatherMeasurements.internalTemperature,
            [WeatherMeasurementType.InternalHumidity]:
                schema.weatherMeasurements.internalHumidity,
            [WeatherMeasurementType.Illuminance]:
                schema.weatherMeasurements.illuminance,
            [WeatherMeasurementType.BatteryVoltage]:
                schema.weatherMeasurements.batteryVoltage,
            [WeatherMeasurementType.BatteryCurrent]:
                schema.weatherMeasurements.batteryCurrent,
            [WeatherMeasurementType.BatteryPower]:
                schema.weatherMeasurements.batteryPower,
            [WeatherMeasurementType.BatteryLevel]:
                schema.weatherMeasurements.batteryLevel,
            [WeatherMeasurementType.SolarPanelVoltage]:
                schema.weatherMeasurements.solarPanelVoltage,
            [WeatherMeasurementType.SolarPanelCurrent]:
                schema.weatherMeasurements.solarPanelCurrent,
            [WeatherMeasurementType.SolarPanelPower]:
                schema.weatherMeasurements.solarPanelPower,
        } satisfies Record<WeatherMeasurementType, unknown>;
        const column = sensorColumns[type];
        // Epoch-based bucketing works for any interval size (date_trunc only accepts single units)
        const s = sql.raw(String(bucketSeconds));
        const bucketExpr = sql<string>`to_timestamp(floor(extract(epoch from ${schema.weatherMeasurements.date}) / ${s}) * ${s})`;

        return this.database
            .select({
                bucket: bucketExpr,
                avg: sql<number>`round(avg(${column})::numeric, 2)`,
                min: sql<number>`round(min(${column})::numeric, 2)`,
                max: sql<number>`round(max(${column})::numeric, 2)`,
            })
            .from(schema.weatherMeasurements)
            .where(between(schema.weatherMeasurements.date, from, till))
            .groupBy(bucketExpr)
            .orderBy(asc(bucketExpr));
    }

    private getBucketSecondsForRange(from: Date, to: Date): number {
        const diffDays =
            (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 2) return 900; // 15 min
        if (diffDays <= 14) return 3600; // 1 hr
        if (diffDays <= 90) return 21600; // 6 hr
        return 86400; // 1 day
    }

    private getAggregationConfig(period: WeatherMeasurementsPeriod): {
        from: Date;
        bucketSeconds: number;
    } {
        switch (period) {
            case WeatherMeasurementsPeriod.Day:
                return {
                    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    bucketSeconds: 900, // 15 minutes
                };
            case WeatherMeasurementsPeriod.Week:
                return {
                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    bucketSeconds: 3600, // 1 hour
                };
            case WeatherMeasurementsPeriod.Month:
                return {
                    from: new Date(
                        new Date().setMonth(new Date().getMonth() - 1),
                    ),
                    bucketSeconds: 21600, // 6 hours
                };
        }
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
