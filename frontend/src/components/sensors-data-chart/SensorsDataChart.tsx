import { useEffect, useState } from 'react';
import { ChartData } from 'chart.js';
import { SensorDataPeriod } from './models/sensor-data-period.model';
import { SensorType } from './models/sensor-type.model';
import { SensorsData } from '../../services/sensors-data/sensors-data.model';
import { getBarChartData, getLineChartData } from './utils/chart-data.util';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';
import LinearChart from '../charts/linear-chart/LinearChart';
import BarChart from '../charts/bar-chart/BarChart';
import './SensorsDataChart.css';

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
    const prepareChartData = (sensorsData: SensorsData[]): void => {
      const data =
        sensorType !== SensorType.BatteryCharging
          ? getLineChartData(sensorType, sensorsData)
          : getBarChartData(sensorType, sensorsData);
      setChartData(data);
    };

    const getSensorsData = async () => {
      setIsDataLoading(true);
      switch (sensorDataPeriod) {
        case SensorDataPeriod.Day:
          {
            const { data } = await SensorsDataService.getDataForDay();
            prepareChartData(data);
          }
          break;
        case SensorDataPeriod.Week:
          {
            const { data } = await SensorsDataService.getDataForWeek();
            prepareChartData(data);
          }
          break;
        case SensorDataPeriod.Month:
          {
            const { data } = await SensorsDataService.getDataForMonth();
            prepareChartData(data);
          }
          break;
      }
      setIsDataLoading(false);
    };

    getSensorsData();
  }, [sensorType, sensorDataPeriod]);

  return (
    <div>
      <div className="toggles">
        <div className="sensor-type-toggles">
          {Object.values(SensorType).map((type) => {
            return (
              <div
                className={`sensor-type-toggle ${
                  type === sensorType ? 'checked' : ''
                }`}
                key={type}
              >
                <input
                  type="radio"
                  id={type}
                  value={type}
                  name={type}
                  checked={type === sensorType}
                  onChange={() => setSensorType(type)}
                />
                <label htmlFor={type}>{type}</label>
              </div>
            );
          })}
        </div>
        <div className="sensor-data-period-toggles">
          {Object.values(SensorDataPeriod).map((period) => {
            return (
              <div
                className={`sensor-type-toggle ${
                  period === sensorDataPeriod ? 'checked' : ''
                }`}
                key={period}
              >
                <input
                  type="radio"
                  id={period}
                  value={period}
                  name={period}
                  checked={period === sensorDataPeriod}
                  onChange={() => setSensorDataPeriod(period)}
                />
                <label htmlFor={period}>{period}</label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={isDataLoading ? 'chart-data-loading' : ''}>
        {sensorType !== SensorType.BatteryCharging ? (
          <LinearChart data={chartData as ChartData<'line'>}></LinearChart>
        ) : (
          <BarChart data={chartData as ChartData<'bar'>}></BarChart>
        )}
      </div>
    </div>
  );
}

export default SensorsDataChart;
