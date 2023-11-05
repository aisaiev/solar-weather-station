import { IsNumber, IsString } from 'class-validator';

export class SensorsDataMqttInput {
  @IsString()
  mcu: string;

  @IsNumber()
  cpuFrequency: number;

  @IsNumber()
  ramUsageKb: number;

  @IsNumber()
  ramUsagePercent: number;

  @IsNumber()
  temperature: number;

  @IsNumber()
  internalTemperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  internalHumidity: number;

  @IsNumber()
  pressure: number;

  @IsNumber()
  illuminance: number;

  @IsNumber()
  batteryVoltage: number;

  @IsNumber()
  batteryLevel: number;

  constructor(data: {
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
  }) {
    this.mcu = data.mcu;
    this.cpuFrequency = data.cpuFrequency;
    this.ramUsageKb = data.ramUsageKb;
    this.ramUsagePercent = data.ramUsagePercent;
    this.temperature = data.temperature;
    this.internalTemperature = data.internalTemperature;
    this.humidity = data.humidity;
    this.internalHumidity = data.internalHumidity;
    this.pressure = data.pressure;
    this.illuminance = data.illuminance;
    this.batteryVoltage = data.batteryVoltage;
    this.batteryLevel = data.batteryLevel;
  }
}
