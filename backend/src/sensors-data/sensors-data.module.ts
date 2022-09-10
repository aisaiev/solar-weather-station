import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SensorsDataController } from './controller/sensors-data.controller';
import { SensorsDataService } from './service/sensors-data.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SensorsDataController],
  providers: [SensorsDataService],
})
export class SensorsDataModule {}
