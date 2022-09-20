import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { SensorsDataModule } from './sensors-data/sensors-data.module';
import { MqttGatewayModule } from './mqtt-gateway/mqtt-gateway.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../frontend/build'),
    }),
    AppConfigModule,
    SensorsDataModule,
    MqttGatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
