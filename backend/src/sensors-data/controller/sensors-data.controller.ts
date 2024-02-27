import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SensorsData } from '@prisma/client';
import { SensorsDataService } from '../service/sensors-data.service';
import { SensorType } from '../models/sensor-type.enum';

@Controller('sensors-data')
export class SensorsDataController {
  constructor(private readonly sensorsDataService: SensorsDataService) {}

  @Get('latest')
  async getLatestSensorsData(): Promise<SensorsData> {
    return this.sensorsDataService.getLatestSensorsData();
  }

  @Get('day')
  async getSensorsDataForDay(
    @Query('sensorType') sensorType: SensorType,
  ): Promise<Record<string, number>[]> {
    if (sensorType && !Object.values(SensorType).includes(sensorType)) {
      throw new BadRequestException('Invalid sensor type');
    }
    return this.sensorsDataService.getSensorsDataForDay(sensorType);
  }

  @Get('week')
  async getSensorsDataForWeek(
    @Query('sensorType') sensorType: SensorType,
  ): Promise<Record<string, number>[]> {
    if (sensorType && !Object.values(SensorType).includes(sensorType)) {
      throw new BadRequestException('Invalid sensor type');
    }
    return this.sensorsDataService.getSensorsDataForWeek(sensorType);
  }

  @Get('month')
  async getSensorsDataForMonth(
    @Query('sensorType') sensorType: SensorType,
  ): Promise<Record<string, number>[]> {
    if (sensorType && !Object.values(SensorType).includes(sensorType)) {
      throw new BadRequestException('Invalid sensor type');
    }
    return this.sensorsDataService.getSensorsDataForMonth(sensorType);
  }
}
