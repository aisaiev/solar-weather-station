import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { SensorType } from '@/core/models/sensor-type.enum';

export function formatSensorValue(value: number | undefined | null, type: SensorType): string {
  if (value == null) return '—';
  switch (type) {
    case SensorType.Temperature:
    case SensorType.InternalTemperature:
      return `${value.toFixed(1)} °C`;
    case SensorType.Humidity:
    case SensorType.InternalHumidity:
      return `${value.toFixed(1)} %`;
    case SensorType.Pressure:
      return `${value.toFixed(1)} hPa`;
    case SensorType.Illuminance:
      return `${Math.round(value)} lx`;
    case SensorType.BatteryVoltage:
    case SensorType.SolarPanelVoltage:
      return `${parseFloat(value.toFixed(2))} V`;
    case SensorType.BatteryCurrent:
    case SensorType.SolarPanelCurrent:
      return `${parseFloat(value.toFixed(2))} A`;
    case SensorType.BatteryPower:
    case SensorType.SolarPanelPower:
      return `${parseFloat(value.toFixed(3))} W`;
    case SensorType.BatteryLevel:
      return `${Math.round(value)} %`;
    default:
      return String(value);
  }
}

export function formatChartDate(dateString: string, period: SensorDataPeriod): string {
  const date = new Date(dateString);
  switch (period) {
    case SensorDataPeriod.Day:
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    case SensorDataPeriod.Week:
    case SensorDataPeriod.Month: {
      const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
      const day = date.getDate();
      const time = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${weekday} ${day}, ${time}`;
    }
  }
}

export function formatTooltipDate(dateString: string): string {
  const date = new Date(dateString);
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${weekday} ${day}, ${time}`;
}

export function formatMeasurementDate(dateString: string): string {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString('en-GB', {
    timeZone: 'Europe/Kyiv',
    day: 'numeric',
    month: 'short',
  });
  const timePart = date.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const tzPart =
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Kyiv',
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';
  return tzPart ? `${datePart}, ${timePart} ${tzPart}` : `${datePart}, ${timePart}`;
}

export function getKyivLocalTimeString(): string {
  const date = new Date();
  const timePart = date.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const tzPart =
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Kyiv',
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';
  return tzPart ? `${timePart} ${tzPart}` : timePart;
}
