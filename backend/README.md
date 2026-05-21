# Solar Weather Station — Backend

NestJS backend for the Solar Weather Station project. Ingests sensor data from an ESP32-based weather station via MQTT, stores it in PostgreSQL using Drizzle ORM, and exposes a REST API consumed by the Angular frontend. Also serves the frontend's static build.

## Tech Stack

- **Framework**: NestJS (Node.js / TypeScript)
- **Database**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Transport**: MQTT (receives sensor payloads from the embedded device)
- **Static serving**: `@nestjs/serve-static` (serves `../frontend/build`)

## Prerequisites

- Node.js 20+
- PostgreSQL instance
- MQTT broker accessible by the backend

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/solar_weather

MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USER=your_mqtt_user
MQTT_PASSWORD=your_mqtt_password
MQTT_TOPIC=weather/station
```

## Installation

```bash
npm install
```

## Running

```bash
# development
npm run start

# watch mode (auto-reload)
npm run start:dev

# production
npm run start:prod
```

## Database Migrations

Migrations are managed with [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview).

```bash
# generate a new migration from schema changes
npx drizzle-kit generate

# apply pending migrations
npx drizzle-kit migrate
```

Migration files live in `drizzle/`.

## API Endpoints

All endpoints are prefixed with `/weather-measurements`.

| Method | Path                               | Query params              | Description                                 |
|--------|------------------------------------|---------------------------|---------------------------------------------|
| GET    | `/weather-measurements`            | `period`, `type`          | Raw measurements for the given period       |
| GET    | `/weather-measurements/aggregated` | `period`, `type`          | Aggregated (averaged) measurements          |
| GET    | `/weather-measurements/latest`     | —                         | Most recent measurement across all sensors  |

### Query Parameters

**`period`** — time window:
- `day`
- `week`
- `month`

**`type`** — measurement field:
- `temperature`, `internalTemperature`
- `humidity`, `internalHumidity`
- `pressure`
- `illuminance`
- `batteryVoltage`, `batteryCurrent`, `batteryPower`, `batteryLevel`
- `solarPanelVoltage`, `solarPanelCurrent`, `solarPanelPower`

## Database Schema

Table: `WeatherMeasurements`

| Column                | Type        | Description                        |
|-----------------------|-------------|------------------------------------|
| `id`                  | serial PK   |                                    |
| `mcu`                 | varchar(32) | MCU identifier                     |
| `cpuFrequency`        | real        | CPU frequency (MHz)                |
| `ramUsageKb`          | real        | RAM usage (KB)                     |
| `ramUsagePercent`     | real        | RAM usage (%)                      |
| `temperature`         | real        | External temperature (°C)          |
| `internalTemperature` | real        | MCU/enclosure temperature (°C)     |
| `humidity`            | real        | External relative humidity (%)     |
| `internalHumidity`    | real        | Internal relative humidity (%)     |
| `pressure`            | real        | Atmospheric pressure (hPa)         |
| `illuminance`         | real        | Light intensity (lux)              |
| `batteryVoltage`      | real        | Battery voltage (V)                |
| `batteryCurrent`      | real        | Battery current (A)                |
| `batteryPower`        | real        | Battery power (W)                  |
| `batteryLevel`        | real        | Battery state of charge (%)        |
| `solarPanelVoltage`   | real        | Solar panel voltage (V)            |
| `solarPanelCurrent`   | real        | Solar panel current (A)            |
| `solarPanelPower`     | real        | Solar panel power (W)              |
| `date`                | timestamp   | Measurement timestamp (indexed)    |

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```
