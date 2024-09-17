import { Module } from '@nestjs/common';
import { WeatherMeasurementsController } from './controller/weather-measurements.controller';
import { WeatherMeasurementsService } from './service/weather-measurements.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [WeatherMeasurementsController],
    providers: [WeatherMeasurementsService],
    exports: [WeatherMeasurementsService],
})
export class WeatherMeasurementsModule {}
