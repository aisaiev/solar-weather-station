import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetWeatherMeasurementsQuery } from './get-weather-measurements.params';

describe('GetWeatherMeasurementsQuery DTO', () => {
    it('accepts period+type query', async () => {
        const dto = plainToInstance(GetWeatherMeasurementsQuery, {
            period: 'day',
            type: 'temperature',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('accepts from/to+type query', async () => {
        const dto = plainToInstance(GetWeatherMeasurementsQuery, {
            from: '2026-01-01T00:00:00.000Z',
            to: '2026-01-02T00:00:00.000Z',
            type: 'humidity',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rejects invalid period', async () => {
        const dto = plainToInstance(GetWeatherMeasurementsQuery, {
            period: 'year',
            type: 'temperature',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects missing type', async () => {
        const dto = plainToInstance(GetWeatherMeasurementsQuery, {
            period: 'day',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid from/to format when custom range used', async () => {
        const dto = plainToInstance(GetWeatherMeasurementsQuery, {
            from: 'bad-date',
            to: 'also-bad',
            type: 'pressure',
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
