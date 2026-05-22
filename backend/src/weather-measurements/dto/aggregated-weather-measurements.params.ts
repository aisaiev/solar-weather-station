import { WeatherMeasurementsPeriod } from './weather-measurements-period.enum';
import { WeatherMeasurementType } from './weather-measurment-type.enum';

export type AggregatedWeatherMeasurementsParams =
    | { period: WeatherMeasurementsPeriod; type: WeatherMeasurementType }
    | { from: Date; to: Date; type: WeatherMeasurementType };
