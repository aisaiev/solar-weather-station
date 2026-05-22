import { SensorDataPeriod } from './sensor-data-period.enum';
import { SensorType } from './sensor-type.enum';
import { ExportScope } from './export-scope.enum';

type ExportCsvBaseParams = {
  scope: ExportScope;
  type?: SensorType;
};

export type ExportCsvParams =
  | (ExportCsvBaseParams & { period: Exclude<SensorDataPeriod, SensorDataPeriod.Custom> })
  | (ExportCsvBaseParams & { from: Date; to: Date });
