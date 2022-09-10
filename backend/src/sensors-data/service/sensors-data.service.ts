import { Injectable } from '@nestjs/common';
import { Prisma, SensorsData } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class SensorsDataService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSensorsData(): Promise<SensorsData[]> {
    return this.prismaService.sensorsData.findMany();
  }

  async getLatestSensorsData(): Promise<SensorsData> {
    return this.prismaService.sensorsData.findFirst({
      orderBy: { date: 'desc' },
    });
  }

  async createSensorsData(
    data: Prisma.SensorsDataCreateInput,
  ): Promise<SensorsData> {
    return this.prismaService.sensorsData.create({
      data,
    });
  }
}
