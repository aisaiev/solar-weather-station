import { Module } from '@nestjs/common';
import { WeatherMeasurementsController } from './controller/weather-measurements.controller';
import { WeatherMeasurementsService } from './service/weather-measurements.service';
import { DatabaseModule } from 'src/database/database.module';
import { WeatherMeasurementsEventsService } from './service/weather-measurements-events.service';

@Module({
    imports: [DatabaseModule],
    controllers: [WeatherMeasurementsController],
    providers: [WeatherMeasurementsService, WeatherMeasurementsEventsService],
    exports: [WeatherMeasurementsService, WeatherMeasurementsEventsService],
})
export class WeatherMeasurementsModule {}
