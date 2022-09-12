import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { SensorsDataModule } from './sensors-data/sensors-data.module';
import { MqttGatewayModule } from './mqtt-gateway/mqtt-gateway.module';

@Module({
  imports: [AppConfigModule, SensorsDataModule, MqttGatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
