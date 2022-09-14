import { Controller, Get } from '@nestjs/common';
import { SensorsData } from '@prisma/client';
import { SensorsDataService } from '../service/sensors-data.service';

@Controller('sensors-data')
export class SensorsDataController {
  constructor(private readonly sensorsDataService: SensorsDataService) {}

  @Get('latest')
  async getLatestSensorsData(): Promise<SensorsData> {
    return this.sensorsDataService.getLatestSensorsData();
  }

  @Get('day')
  async getSensorsDataForDay(): Promise<SensorsData[]> {
    return this.sensorsDataService.getSensorsDataForDay();
  }

  @Get('week')
  async getSensorsDataForWeek(): Promise<SensorsData[]> {
    return this.sensorsDataService.getSensorsDataForWeek();
  }

  @Get('month')
  async getSensorsDataForMonth(): Promise<SensorsData[]> {
    return this.sensorsDataService.getSensorsDataForMonth();
  }
}
