import {
    IsEnum,
    IsISO8601,
    IsNotEmpty,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { WeatherMeasurementsPeriod } from './weather-measurements-period.enum';
import { ExportScope } from './export-scope.enum';
import { WeatherMeasurementType } from './weather-measurment-type.enum';

export class ExportWeatherMeasurementsQuery {
    @ValidateIf((o: ExportWeatherMeasurementsQuery) => !o.from && !o.to)
    @IsEnum(WeatherMeasurementsPeriod)
    @IsNotEmpty()
    period?: WeatherMeasurementsPeriod;

    @ValidateIf((o: ExportWeatherMeasurementsQuery) => !o.period)
    @IsISO8601()
    @IsOptional()
    from?: string;

    @ValidateIf((o: ExportWeatherMeasurementsQuery) => !o.period)
    @IsISO8601()
    @IsOptional()
    to?: string;

    @IsEnum(ExportScope)
    @IsNotEmpty()
    scope: ExportScope;

    @ValidateIf(
        (o: ExportWeatherMeasurementsQuery) => o.scope === ExportScope.Selected,
    )
    @IsEnum(WeatherMeasurementType)
    @IsNotEmpty()
    type?: WeatherMeasurementType;
}
