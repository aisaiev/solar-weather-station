import { WeatherMeasurementsMqttDto } from 'src/mqtt-gateway/models/weather-measuremets-mqtt.dto';

export type CreateWeatherMeasurementRequest = WeatherMeasurementsMqttDto & {
    date: Date;
};
