import { IsNumber, IsOptional, IsString } from 'class-validator';

export class WeatherMeasurementsMqttDto {
    @IsOptional()
    @IsString()
    mcu: string;

    @IsOptional()
    @IsNumber()
    cpuFrequency: number;

    @IsOptional()
    @IsNumber()
    ramUsageKb: number;

    @IsOptional()
    @IsNumber()
    ramUsagePercent: number;

    @IsOptional()
    @IsNumber()
    temperature: number;

    @IsOptional()
    @IsNumber()
    internalTemperature: number;

    @IsOptional()
    @IsNumber()
    humidity: number;

    @IsOptional()
    @IsNumber()
    internalHumidity: number;

    @IsOptional()
    @IsNumber()
    pressure: number;

    @IsOptional()
    @IsNumber()
    illuminance: number;

    @IsOptional()
    @IsNumber()
    batteryVoltage: number;

    @IsOptional()
    @IsNumber()
    batteryCurrent: number;

    @IsOptional()
    @IsNumber()
    batteryPower: number;

    @IsOptional()
    @IsNumber()
    batteryLevel: number;

    @IsOptional()
    @IsNumber()
    solarPanelVoltage: number;

    @IsOptional()
    @IsNumber()
    solarPanelCurrent: number;

    @IsOptional()
    @IsNumber()
    solarPanelPower: number;

    constructor(data: Partial<WeatherMeasurementsMqttDto>) {
        Object.assign(this, data);
    }
}
