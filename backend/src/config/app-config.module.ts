import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ENV_FILE_PATH } from './app-config.consts';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_FILE_PATH,
    }),
  ],
})
export class AppConfigModule {}
