export interface SensorsData {
  date: string;
  mcu?: string;
  cpuFrequency?: number;
  ramUsageKb?: number;
  ramUsagePercent?: number;
  temperature?: number;
  internalTemperature?: number;
  humidity?: number;
  internalHumidity?: number;
  pressure?: number;
  illuminance?: number;
  batteryVoltage?: number;
  batteryCurrent?: number;
  batteryPower?: number;
  batteryLevel?: number;
  solarPanelVoltage?: number;
  solarPanelCurrent?: number;
  solarPanelPower?: number;
}
