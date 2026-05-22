import { toChartPoints } from './sensors-data.util';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';

describe('toChartPoints', () => {
  it('should map aggregated points preserving min/max/avg/bucket', () => {
    const input = [
      {
        bucket: '2026-01-01T12:30:00.000Z',
        avg: 10.5,
        min: 8,
        max: 12,
      },
    ];

    const result = toChartPoints(input, SensorDataPeriod.Day);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      bucket: input[0].bucket,
      avg: 10.5,
      min: 8,
      max: 12,
    });
    expect(typeof result[0].date).toBe('string');
  });

  it('should include year in custom period labels when data spans years', () => {
    const input = [
      {
        bucket: '2025-12-31T10:30:00.000Z',
        avg: 1,
        min: 1,
        max: 1,
      },
      {
        bucket: '2026-01-01T10:30:00.000Z',
        avg: 2,
        min: 2,
        max: 2,
      },
    ];

    const result = toChartPoints(input, SensorDataPeriod.Custom);

    expect(result[0].date).toContain('2025');
    expect(result[1].date).toContain('2026');
  });
});
