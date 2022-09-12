import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SensorsDataModule } from 'src/sensors-data/sensors-data.module';
import { MqttService } from './service/mqtt.service';

@Module({
  imports: [ConfigModule, SensorsDataModule],
  exports: [MqttService],
  providers: [MqttService],
})
export class MqttGatewayModule {}
