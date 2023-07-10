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
  uvLevel: number;

  @IsNumber()
  uvRisk: number;

  @IsNumber()
  uvIndex: number;

  @IsNumber()
  uvPower: number;

  @IsNumber()
  illuminance: number;

  @IsNumber()
  rainAnalog: number;

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
    uvLevel: number;
    uvRisk: number;
    uvIndex: number;
    uvPower: number;
    illuminance: number;
    rainAnalog: number;
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
    this.uvLevel = data.uvLevel;
    this.uvRisk = data.uvRisk;
    this.uvIndex = data.uvIndex;
    this.uvPower = data.uvPower;
    this.illuminance = data.illuminance;
    this.rainAnalog = data.rainAnalog;
    this.batteryVoltage = data.batteryVoltage;
    this.batteryLevel = data.batteryLevel;
    this.batteryCharging = data.batteryCharging;
  }
}
