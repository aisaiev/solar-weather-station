import { Injectable } from '@nestjs/common';
import { Prisma, SensorsData } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class SensorsDataService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllSensorsData(): Promise<SensorsData[]> {
    return this.prismaService.sensorsData.findMany();
  }

  async getLatestSensorsData(): Promise<SensorsData> {
    return this.prismaService.sensorsData.findFirst({
      orderBy: { date: 'desc' },
    });
  }

  async getSensorsDataForDay(): Promise<SensorsData[]> {
    return this.prismaService.sensorsData.findMany({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
          lte: new Date(),
        },
      },
    });
  }

  async getSensorsDataForWeek(): Promise<SensorsData[]> {
    return this.prismaService.sensorsData.findMany({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          lte: new Date(),
        },
      },
    });
  }

  async getSensorsDataForMonth(): Promise<SensorsData[]> {
    return this.prismaService.sensorsData.findMany({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getMonth() - 1)),
          lte: new Date(),
        },
      },
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
