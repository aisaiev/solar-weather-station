import { useEffect, useState } from 'react';
import { ChartData } from 'chart.js';
import { SensorDataPeriod } from './models/sensor-data-period.model';
import { SensorType } from './models/sensor-type.model';
import { getLineChartData } from './utils/chart-data.util';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';
import LinearChart from '../charts/linear-chart/LinearChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SensorsDataChart() {
  const [sensorType, setSensorType] = useState<SensorType>(
    SensorType.Temperature,
  );
  const [sensorDataPeriod, setSensorDataPeriod] = useState<SensorDataPeriod>(
    SensorDataPeriod.Day,
  );
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<
    ChartData<'line'> | ChartData<'bar'>
  >({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const prepareChartData = (sensorsData: Record<string, number>[]): void => {
      const data = getLineChartData(sensorType, sensorsData);
      setChartData(data);
    };

    const getSensorsData = async () => {
      setIsDataLoading(true);
      switch (sensorDataPeriod) {
        case SensorDataPeriod.Day:
          {
            const { data } = await SensorsDataService.getDataForDay(sensorType);
            prepareChartData(data);
          }
          break;
        case SensorDataPeriod.Week:
          {
            const { data } = await SensorsDataService.getDataForWeek(sensorType);
            prepareChartData(data);
          }
          break;
        case SensorDataPeriod.Month:
          {
            const { data } = await SensorsDataService.getDataForMonth(sensorType);
            prepareChartData(data);
          }
          break;
      }
      setIsDataLoading(false);
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
            <LinearChart
              data={chartData as ChartData<'line'>}
              sensorType={sensorType}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SensorsDataChart;
