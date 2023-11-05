export interface SensorsData {
  id: string;
  mcu: string;
  cpuFrequency: number;
  ramUsageKb: number;
  ramUsagePercent: number;
  temperature: number;
  internalTemperature: number;
  humidity: number;
  internalHumidity: number;
  pressure: number;
  illuminance: number;
  batteryVoltage: number;
  batteryLevel: number;
  date: string;
}
