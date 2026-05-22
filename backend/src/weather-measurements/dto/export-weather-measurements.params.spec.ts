import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ExportWeatherMeasurementsQuery } from './export-weather-measurements.params';

describe('ExportWeatherMeasurementsQuery DTO', () => {
    it('accepts all-scope period export without type', async () => {
        const dto = plainToInstance(ExportWeatherMeasurementsQuery, {
            period: 'day',
            scope: 'all',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('accepts selected-scope period export with type', async () => {
        const dto = plainToInstance(ExportWeatherMeasurementsQuery, {
            period: 'week',
            scope: 'selected',
            type: 'temperature',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('accepts all-scope custom range export', async () => {
        const dto = plainToInstance(ExportWeatherMeasurementsQuery, {
            from: '2026-01-01T00:00:00.000Z',
            to: '2026-01-03T00:00:00.000Z',
            scope: 'all',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects selected scope without type', async () => {
        const dto = plainToInstance(ExportWeatherMeasurementsQuery, {
            period: 'day',
            scope: 'selected',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid scope', async () => {
        const dto = plainToInstance(ExportWeatherMeasurementsQuery, {
            period: 'day',
            scope: 'invalid',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid custom date range format', async () => {
        const dto = plainToInstance(ExportWeatherMeasurementsQuery, {
            from: 'not-iso',
            to: '2026-01-03T00:00:00.000Z',
            scope: 'all',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
