import { IsEnum, IsNotEmpty } from 'class-validator';
import { WeatherMeasurementsPeriod } from './weather-measurements-period.enum';
import { WeatherMeasurementType } from './weather-measurment-type.enum';

export class GetWeatherMeasurementsQuery {
    @IsEnum(WeatherMeasurementsPeriod)
    @IsNotEmpty()
    period: WeatherMeasurementsPeriod;

    @IsEnum(WeatherMeasurementType)
    @IsNotEmpty()
    type: WeatherMeasurementType;
}
