CREATE TABLE IF NOT EXISTS "WeatherMeasurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"mcu" varchar(32),
	"cpuFrequency" real,
	"ramUsageKb" real,
	"ramUsagePercent" real,
	"temperature" real,
	"internalTemperature" real,
	"humidity" real,
	"internalHumidity" real,
	"pressure" real,
	"illuminance" real,
	"batteryVoltage" real,
	"batteryLevel" real,
	"date" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "date_idx" ON "WeatherMeasurements" USING btree ("date");