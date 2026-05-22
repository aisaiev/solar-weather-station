import { SensorDataPeriod } from './sensor-data-period.enum';
import { SensorType } from './sensor-type.enum';

export type AggregatedDataParams =
  | { period: SensorDataPeriod; type: SensorType }
  | { from: Date; to: Date; type: SensorType };
