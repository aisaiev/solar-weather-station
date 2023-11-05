import { ChartData } from 'chart.js';
import { SensorsData } from '../../../services/sensors-data/sensors-data.model';
import { formatNumberPrecission } from '../../../utils/formatter.util';
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
            case SensorType.InternalTemperature:
              return formatNumberPrecission(sd.internalTemperature, 1);
            case SensorType.Humidity:
              return formatNumberPrecission(sd.humidity, 1);
            case SensorType.InternalHumidity:
              return formatNumberPrecission(sd.internalHumidity, 1);
            case SensorType.Pressure:
              return formatNumberPrecission(sd.pressure, 1);
            case SensorType.Illuminance:
              return formatNumberPrecission(sd.illuminance, 0);
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
