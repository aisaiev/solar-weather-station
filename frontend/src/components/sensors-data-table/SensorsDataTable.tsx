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
  formatSensorValue,
  getKyivLocalTimeString,
} from '../../utils/formatter.util';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* System Status */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mt-4 mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            System Status
          </h3>
          <Table>
            <TableBody>
              <DataRow
                icon={Clock}
                label="Local time"
                value={sensorsData && getKyivLocalTimeString()}
              />
              <DataRow
                icon={ClockArrowUp}
                label="Last updated"
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Environmental Sensors */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mt-4 mb-4 flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Environment
          </h3>
          <Table>
            <TableBody>
              <DataRow
                icon={Thermometer}
                label="Temperature"
                value={sensorsData && formatSensorValue(sensorsData.temperature, 1, '°C')}
              />
              <DataRow
                icon={Droplet}
                label="Humidity"
                value={sensorsData && formatSensorValue(sensorsData.humidity, 1, '%')}
              />
              <DataRow
                icon={Gauge}
                label="Pressure"
                value={sensorsData && formatSensorValue(sensorsData.pressure, 1, 'hPa')}
              />
              <DataRow
                icon={Sun}
                label="Illuminance"
                value={sensorsData && formatSensorValue(sensorsData.illuminance, 0, 'lx')}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Internal Sensors */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mt-4 mb-4 flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Internal
          </h3>
          <Table>
            <TableBody>
              <DataRow
                icon={Thermometer}
                label="Temperature"
                value={sensorsData && formatSensorValue(sensorsData.internalTemperature, 1, '°C')}
              />
              <DataRow
                icon={Droplet}
                label="Humidity"
                value={sensorsData && formatSensorValue(sensorsData.internalHumidity, 1, '%')}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Battery */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mt-4 mb-4 flex items-center gap-2">
            <Battery className="h-5 w-5" />
            Battery
          </h3>
          <Table>
            <TableBody>
              <DataRow
                icon={Battery}
                label="Level"
                value={sensorsData && formatSensorValue(sensorsData.batteryLevel, 0, '%')}
              />
              <DataRow
                icon={Zap}
                label="Voltage"
                value={sensorsData && formatSensorValue(sensorsData.batteryVoltage, 2, 'V')}
              />
              <DataRow
                icon={Zap}
                label="Current"
                value={sensorsData && formatSensorValue(sensorsData.batteryCurrent, 2, 'A')}
              />
              <DataRow
                icon={Zap}
                label="Power"
                value={sensorsData && formatSensorValue(sensorsData.batteryPower, 2, 'W')}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Solar Panel */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mt-4 mb-4 flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Solar Panel
          </h3>
          <Table>
            <TableBody>
              <DataRow
                icon={Zap}
                label="Voltage"
                value={sensorsData && formatSensorValue(sensorsData.solarPanelVoltage, 2, 'V')}
              />
              <DataRow
                icon={Zap}
                label="Current"
                value={sensorsData && formatSensorValue(sensorsData.solarPanelCurrent, 2, 'A')}
              />
              <DataRow
                icon={Zap}
                label="Power"
                value={sensorsData && formatSensorValue(sensorsData.solarPanelPower, 2, 'W')}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default SensorsDataTable;
