import { useEffect, useState } from 'react';
import {
  Clock,
  ClockArrowUp,
  Cpu,
  Activity,
  MemoryStick,
  Thermometer,
  Droplet,
  Gauge,
  Sun,
  Zap,
  Battery,
} from 'lucide-react';
import { SensorsData } from '../../services/sensors-data/sensors-data.model';
import {
  convertDateStringToKyivDateTimeString,
  formatNumberPrecission,
  getKyivLocalTimeString,
} from '../../utils/formatter.util';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function SensorsDataTable() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [sensorsData, setSensorsData] = useState<SensorsData>();

  const getLatestSensorsData = async () => {
    setIsDataLoading(true);
    const { data } = await SensorsDataService.getLatestData();
    setSensorsData(data);
    setIsDataLoading(false);
  };

  useEffect(() => {
    getLatestSensorsData();
  }, []);

  const DataRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | undefined;
  }) => (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </div>
      </TableCell>
      <TableCell>
        {isDataLoading ? (
          <Skeleton className="h-5 w-24" />
        ) : (
          <span>{value}</span>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardContent>
        <Table>
          <TableBody>
            <DataRow
              icon={Clock}
              label="Local time"
              value={sensorsData && getKyivLocalTimeString()}
            />
            <DataRow
              icon={ClockArrowUp}
              label="Last updated on"
              value={
                sensorsData &&
                convertDateStringToKyivDateTimeString(sensorsData?.date)
              }
            />
            <DataRow
              icon={Cpu}
              label="MCU"
              value={sensorsData?.mcu}
            />
            <DataRow
              icon={Activity}
              label="CPU frequency"
              value={
                sensorsData &&
                `${sensorsData.cpuFrequency} MHz`
              }
            />
            <DataRow
              icon={MemoryStick}
              label="RAM usage"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.ramUsagePercent, 0)}% (${formatNumberPrecission(sensorsData.ramUsageKb, 0)} KB)`
              }
            />
            <DataRow
              icon={Thermometer}
              label="Temperature"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.temperature, 1)} °C`
              }
            />
            <DataRow
              icon={Droplet}
              label="Humidity"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.humidity, 1)} %`
              }
            />
            <DataRow
              icon={Gauge}
              label="Pressure"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.pressure, 1)} hPa`
              }
            />
            <DataRow
              icon={Sun}
              label="Illuminance"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.illuminance, 0)} lx`
              }
            />
            <DataRow
              icon={Thermometer}
              label="Internal Temperature"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.internalTemperature, 1)} °C`
              }
            />
            <DataRow
              icon={Droplet}
              label="Internal Humidity"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.internalHumidity, 1)} %`
              }
            />
            <DataRow
              icon={Zap}
              label="Battery voltage"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.batteryVoltage, 2)} V`
              }
            />
            <DataRow
              icon={Zap}
              label="Battery current"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.batteryCurrent, 2)} A`
              }
            />
            <DataRow
              icon={Zap}
              label="Battery power"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.batteryPower, 2)} W`
              }
            />
            <DataRow
              icon={Sun}
              label="Solar panel voltage"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.solarPanelVoltage, 2)} V`
              }
            />
            <DataRow
              icon={Sun}
              label="Solar panel current"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.solarPanelCurrent, 2)} A`
              }
            />
            <DataRow
              icon={Sun}
              label="Solar panel power"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.solarPanelPower, 2)} W`
              }
            />
            <DataRow
              icon={Battery}
              label="Battery level"
              value={
                sensorsData &&
                `${formatNumberPrecission(sensorsData.batteryLevel, 0)} %`
              }
            />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default SensorsDataTable;
