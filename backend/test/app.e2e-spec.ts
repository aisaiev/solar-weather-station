import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DATABASE_CONNECTION } from './../src/database/database-connection';

jest.mock('mqtt');
import * as mqtt from 'mqtt';

const mockSubscribe = jest.fn();
const mockMqttClient = { on: jest.fn(), subscribe: mockSubscribe };

const mockFindMany = jest.fn().mockResolvedValue([]);
const mockFindFirst = jest.fn().mockResolvedValue(null);
const mockInsertValues = jest.fn().mockResolvedValue(undefined);
const mockInsert = jest.fn().mockReturnValue({ values: mockInsertValues });
const mockOrderBy = jest.fn().mockResolvedValue([]);
const mockGroupBy = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
const mockSelectWhere = jest.fn().mockReturnValue({ groupBy: mockGroupBy });
const mockFrom = jest.fn().mockReturnValue({ where: mockSelectWhere });
const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

const mockDatabase = {
    select: mockSelect,
    insert: mockInsert,
    query: {
        weatherMeasurements: {
            findMany: mockFindMany,
            findFirst: mockFindFirst,
        },
    },
};

describe('WeatherMeasurements (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        (mqtt.connect as jest.Mock).mockReturnValue(mockMqttClient);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(DATABASE_CONNECTION)
            .useValue(mockDatabase)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        app.setGlobalPrefix('api');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockOrderBy.mockResolvedValue([]);
    });

    describe('GET /api/weather-measurements', () => {
        it('should return 200 with an array for valid period and type', async () => {
            mockFindMany.mockResolvedValueOnce([
                { temperature: 22.5, date: new Date().toISOString() },
            ]);

            const res = await request(app.getHttpServer())
                .get('/api/weather-measurements')
                .query({ period: 'day', type: 'temperature' });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 400 for an invalid period', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/weather-measurements')
                .query({ period: 'invalid', type: 'temperature' });

            expect(res.status).toBe(400);
        });

        it('should return 400 for an invalid type', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/weather-measurements')
                .query({ period: 'day', type: 'invalid' });

            expect(res.status).toBe(400);
        });

        it('should return 400 when query params are missing', async () => {
            const res = await request(app.getHttpServer()).get(
                '/api/weather-measurements',
            );

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/weather-measurements/aggregated', () => {
        it('should return 200 with aggregated data for valid params', async () => {
            const mockData = [
                {
                    bucket: '2024-01-01T00:00:00Z',
                    avg: 22.5,
                    min: 20.0,
                    max: 25.0,
                },
            ];
            mockOrderBy.mockResolvedValueOnce(mockData);

            const res = await request(app.getHttpServer())
                .get('/api/weather-measurements/aggregated')
                .query({ period: 'week', type: 'humidity' });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 400 for invalid query params', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/weather-measurements/aggregated')
                .query({ period: 'bad', type: 'humidity' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/weather-measurements/latest', () => {
        it('should return 200 with the latest measurement', async () => {
            const mockMeasurement = {
                temperature: 22.5,
                humidity: 60,
                date: new Date().toISOString(),
            };
            mockFindFirst.mockResolvedValueOnce(mockMeasurement);

            const res = await request(app.getHttpServer()).get(
                '/api/weather-measurements/latest',
            );

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ temperature: 22.5, humidity: 60 });
        });

        it('should return 200 with null body when no measurements exist', async () => {
            mockFindFirst.mockResolvedValueOnce(null);

            const res = await request(app.getHttpServer()).get(
                '/api/weather-measurements/latest',
            );

            expect(res.status).toBe(200);
        });
    });
});
