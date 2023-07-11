import { ChartData } from 'chart.js';
import { SensorsData } from '../../../services/sensors-data/sensors-data.model';
import { formatNumberPrecission, formatUvPower } from '../../../utils/formatter.util';
import { SensorType } from '../models/sensor-type.model';

export const getLineChartData = (
  sensorType: SensorType,
  sensorsData: SensorsData[],
): ChartData<'line'> => {
  return {
    labels: sensorsData.map((sd) => {
      const date = new Date(sd.date).toLocaleDateString('uk', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Kiev',
      });
      return date;
    }),
    datasets: [
      {
        label: sensorType,
        borderColor: 'hsl(195deg, 85%, 41%)',
        cubicInterpolationMode: 'monotone',
        data: sensorsData.map((sd) => {
          switch (sensorType) {
            case SensorType.Temperature:
              return formatNumberPrecission(sd.temperature, 1);
            case SensorType.Humidity:
              return formatNumberPrecission(sd.humidity, 1);
            case SensorType.Pressure:
              return formatNumberPrecission(sd.pressure, 1);
            case SensorType.UVIndex:
              return sd.uvIndex;
            case SensorType.UVPower:
              return formatUvPower(sd.uvPower);
            case SensorType.Illuminance:
              return formatNumberPrecission(sd.illuminance, 0);
            case SensorType.Rain:
              return sd.rainAnalog;
            case SensorType.BatteryVoltage:
              return formatNumberPrecission(sd.batteryVoltage, 2);
            case SensorType.BatteryLevel:
              return sd.batteryLevel;
            default:
              return 0;
          }
        }),
      },
    ],
  };
};

export const getBarChartData = (
  sensorType: SensorType,
  sensorsData: SensorsData[],
): ChartData<'bar'> => {
  return {
    labels: sensorsData.map((sd) => {
      const date = new Date(sd.date).toLocaleDateString('uk', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Kiev',
      });
      return date;
    }),
    datasets: [
      {
        label: sensorType,
        backgroundColor: 'rgb(75, 192, 192)',
        data: sensorsData.map((sd) => {
          switch (sensorType) {
            case SensorType.BatteryCharging:
              return sd.batteryCharging ? 1 : 0;
            default:
              return 0;
          }
        }),
      },
      {
        label: sensorType,
        backgroundColor: 'rgb(255, 99, 132)',
        data: sensorsData.map((sd) => {
          switch (sensorType) {
            case SensorType.BatteryCharging:
              return !sd.batteryCharging ? -1 : 0;
            default:
              return 0;
          }
        }),
      },
    ],
  };
};
