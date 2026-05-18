export interface SensorsData {
  id: string;
  mcu: string;
  cpuFrequency: number;
  ramUsageKb: number;
  ramUsagePercent: number;
  temperature: number | null;
  internalTemperature: number | null;
  humidity: number | null;
  internalHumidity: number | null;
  pressure: number | null;
  illuminance: number | null;
  batteryVoltage: number | null;
  batteryCurrent: number | null;
  batteryPower: number | null;
  batteryLevel: number | null;
  solarPanelVoltage: number | null;
  solarPanelCurrent: number | null;
  solarPanelPower: number | null;
  date: string;
}
