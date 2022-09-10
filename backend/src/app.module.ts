import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { SensorsDataModule } from './sensors-data/sensors-data.module';

@Module({
  imports: [AppConfigModule, SensorsDataModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
