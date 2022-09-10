import { Body, Controller, Get, Post } from '@nestjs/common';
import { Prisma, SensorsData } from '@prisma/client';
import { SensorsDataService } from '../service/sensors-data.service';

@Controller('sensors-data')
export class SensorsDataController {
  constructor(private readonly sensorsDataService: SensorsDataService) {}

  @Get()
  async getSensorsData(): Promise<SensorsData[]> {
    return this.sensorsDataService.getSensorsData();
  }

  @Get('latest')
  async getLatestSensorsData(): Promise<SensorsData> {
    return this.sensorsDataService.getLatestSensorsData();
  }

  @Post()
  async createSensorsData(
    @Body() data: Prisma.SensorsDataCreateInput,
  ): Promise<SensorsData> {
    return this.sensorsDataService.createSensorsData(data);
  }
}
