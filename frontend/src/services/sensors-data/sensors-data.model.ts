export interface SensorsData {
  id: string;
  mcu: string;
  cpuFrequency: number;
  ramUsageKb: number;
  ramUsagePercent: number;
  temperature: number;
  humidity: number;
  pressure: number;
  altitude: number;
  batteryVoltage: number;
  batteryLevel: number;
  batteryCharging: boolean;
  date: string;
}
