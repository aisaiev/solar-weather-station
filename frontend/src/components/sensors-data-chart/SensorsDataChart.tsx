import { useEffect, useState } from 'react';
import { SensorDataPeriod } from './models/sensor-data-period.model';
import { SensorType } from './models/sensor-type.model';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'var(--color-chart-1)',
  },
};

function SensorsDataChart() {
  const [sensorType, setSensorType] = useState<SensorType>(
    SensorType.Temperature,
  );
  const [sensorDataPeriod, setSensorDataPeriod] = useState<SensorDataPeriod>(
    SensorDataPeriod.Day,
  );
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<Array<{ date: string; value: number }>>([]);

  useEffect(() => {
    const getSensorValue = (item: Record<string, any>, type: SensorType): number => {
      switch (type) {
        case SensorType.Temperature:
          return item.temperature;
        case SensorType.Humidity:
          return item.humidity;
        case SensorType.InternalTemperature:
          return item.internalTemperature;
        case SensorType.InternalHumidity:
          return item.internalHumidity;
        case SensorType.Pressure:
          return item.pressure;
        case SensorType.Illuminance:
          return item.illuminance;
        case SensorType.BatteryVoltage:
          return item.batteryVoltage;
        case SensorType.BatteryCurrent:
          return item.batteryCurrent;
        case SensorType.BatteryPower:
          return item.batteryPower;
        case SensorType.SolarPanelVoltage:
          return item.solarPanelVoltage;
        case SensorType.SolarPanelCurrent:
          return item.solarPanelCurrent;
        case SensorType.SolarPanelPower:
          return item.solarPanelPower;
        case SensorType.BatteryLevel:
          return item.batteryLevel;
        default:
          return 0;
      }
    };

    const prepareChartData = (sensorsData: Record<string, any>[]): void => {
      const formattedData = sensorsData.map((item) => ({
        date: new Date(item.date).toLocaleString('en-GB', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        value: Number(getSensorValue(item, sensorType).toFixed(2)),
      }));
      setChartData(formattedData);
    };

    const getSensorsData = async () => {
      setIsDataLoading(true);
      try {
        switch (sensorDataPeriod) {
          case SensorDataPeriod.Day:
            {
              const { data } = await SensorsDataService.getDataForDay(sensorType);
              console.log('Chart data received:', data);
              prepareChartData(data);
            }
            break;
          case SensorDataPeriod.Week:
            {
              const { data } = await SensorsDataService.getDataForWeek(sensorType);
              console.log('Chart data received:', data);
              prepareChartData(data);
            }
            break;
          case SensorDataPeriod.Month:
            {
              const { data } = await SensorsDataService.getDataForMonth(sensorType);
              console.log('Chart data received:', data);
              prepareChartData(data);
            }
            break;
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    getSensorsData();
  }, [sensorType, sensorDataPeriod]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Tabs
                value={sensorType}
                onValueChange={(value) => setSensorType(value as SensorType)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  {Object.values(SensorType).map((type) => (
                    <TabsTrigger key={type} value={type} className="text-xs sm:text-sm">
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div>
              <Tabs
                value={sensorDataPeriod}
                onValueChange={(value) =>
                  setSensorDataPeriod(value as SensorDataPeriod)
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  {Object.values(SensorDataPeriod).map((period) => (
                    <TabsTrigger key={period} value={period} className="text-xs sm:text-sm">
                      {period}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className={isDataLoading ? 'opacity-50' : ''}>
            {chartData.length === 0 && !isDataLoading ? (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No data available for this period
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-value)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-value)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={['auto', 'auto']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    fill="url(#fillValue)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SensorsDataChart;
