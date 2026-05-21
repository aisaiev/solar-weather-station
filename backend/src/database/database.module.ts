import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from './database-connection';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { EnvironmentVariables } from 'src/config/app-config.consts';
import * as weatherMeasurementsSchema from '../weather-measurements/schema';

@Module({
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: (configService: ConfigService) => {
                const pool = new Pool({
                    connectionString: configService.getOrThrow(
                        EnvironmentVariables.DATABASE_URL,
                    ),
                });
                return drizzle({
                    client: pool,
                    schema: {
                        ...weatherMeasurementsSchema,
                    },
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
