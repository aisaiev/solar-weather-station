import { Injectable } from '@nestjs/common';
import { Prisma, SensorsData } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SensorType } from '../models/sensor-type.enum';

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

  async getSensorsDataForDay(
    sensorType: SensorType,
  ): Promise<Record<string, number>[]> {
    return this.prismaService.sensorsData.findMany({
      select: sensorType
        ? {
            [sensorType]: true,
            date: true,
          }
        : undefined,
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
          lte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getSensorsDataForWeek(
    sensorType: SensorType,
  ): Promise<Record<string, number>[]> {
    return this.prismaService.sensorsData.findMany({
      select: sensorType
        ? {
            [sensorType]: true,
            date: true,
          }
        : undefined,
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          lte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getSensorsDataForMonth(
    sensorType: SensorType,
  ): Promise<Record<string, number>[]> {
    return this.prismaService.sensorsData.findMany({
      select: sensorType
        ? {
            [sensorType]: true,
            date: true,
          }
        : undefined,
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          lte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
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
