import { AggregatedDataPoint } from '@/core/models/aggregated-data-point.model';
import { ChartPoint } from '@/core/models/chart-point.model';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { formatChartDate } from '@/core/utils/formatter.util';

export function toChartPoints(data: AggregatedDataPoint[], period: SensorDataPeriod): ChartPoint[] {
  const showYear =
    data.length > 1 &&
    data.some((p) => new Date(p.bucket).getFullYear() !== new Date(data[0].bucket).getFullYear());
  return data.map((point) => ({
    date: formatChartDate(point.bucket, period, showYear),
    bucket: point.bucket,
    avg: point.avg,
    min: point.min,
    max: point.max,
  }));
}
