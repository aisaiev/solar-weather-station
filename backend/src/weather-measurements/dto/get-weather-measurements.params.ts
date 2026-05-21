import {
    IsEnum,
    IsISO8601,
    IsNotEmpty,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { WeatherMeasurementsPeriod } from './weather-measurements-period.enum';
import { WeatherMeasurementType } from './weather-measurment-type.enum';

export class GetWeatherMeasurementsQuery {
    @ValidateIf((o: GetWeatherMeasurementsQuery) => !o.from && !o.to)
    @IsEnum(WeatherMeasurementsPeriod)
    @IsNotEmpty()
    period?: WeatherMeasurementsPeriod;

    @ValidateIf((o: GetWeatherMeasurementsQuery) => !o.period)
    @IsISO8601()
    @IsOptional()
    from?: string;

    @ValidateIf((o: GetWeatherMeasurementsQuery) => !o.period)
    @IsISO8601()
    @IsOptional()
    to?: string;

    @IsEnum(WeatherMeasurementType)
    @IsNotEmpty()
    type: WeatherMeasurementType;
}
