import { IsBoolean, IsNumber, IsString } from 'class-validator';

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
  humidity: number;

  @IsNumber()
  pressure: number;

  @IsNumber()
  altitude: number;

  @IsNumber()
  batteryVoltage: number;

  @IsNumber()
  batteryLevel: number;

  @IsBoolean()
  batteryCharging: boolean;

  constructor(data: {
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
  }) {
    this.mcu = data.mcu;
    this.cpuFrequency = data.cpuFrequency;
    this.ramUsageKb = data.ramUsageKb;
    this.ramUsagePercent = data.ramUsagePercent;
    this.temperature = data.temperature;
    this.humidity = data.humidity;
    this.pressure = data.pressure;
    this.altitude = data.altitude;
    this.batteryVoltage = data.batteryVoltage;
    this.batteryLevel = data.batteryLevel;
    this.batteryCharging = data.batteryCharging;
  }
}
