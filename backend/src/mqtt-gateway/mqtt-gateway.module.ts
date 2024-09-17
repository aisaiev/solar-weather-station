import { Module } from '@nestjs/common';
import { MqttService } from './service/mqtt.service';
import { WeatherMeasurementsModule } from 'src/weather-measurements/weather-measurements.module';

@Module({
    imports: [WeatherMeasurementsModule],
    providers: [MqttService],
})
export class MqttGatewayModule {}
