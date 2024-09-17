import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { MqttGatewayModule } from './mqtt-gateway/mqtt-gateway.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { WeatherMeasurementsModule } from './weather-measurements/weather-measurements.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '../../frontend/build'),
        }),
        AppConfigModule,
        DatabaseModule,
        MqttGatewayModule,
        WeatherMeasurementsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
