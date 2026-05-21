import { AggregatedDataPoint } from '@/core/models/aggregated-data-point.model';
import { ChartPoint } from '@/core/models/chart-point.model';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { formatChartDate } from '@/core/utils/formatter.util';

export function toChartPoints(data: AggregatedDataPoint[], period: SensorDataPeriod): ChartPoint[] {
  return data.map((point) => ({
    date: formatChartDate(point.bucket, period),
    bucket: point.bucket,
    avg: point.avg,
    min: point.min,
    max: point.max,
  }));
}
