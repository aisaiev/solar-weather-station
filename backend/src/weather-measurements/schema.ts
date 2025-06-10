import {
  index,
  pgTable,
  real,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const weatherMeasurements = pgTable(
  'WeatherMeasurements',
  {
    id: serial('id').primaryKey(),
    mcu: varchar('mcu', { length: 32 }),
    cpuFrequency: real('cpuFrequency'),
    ramUsageKb: real('ramUsageKb'),
    ramUsagePercent: real('ramUsagePercent'),
    temperature: real('temperature'),
    internalTemperature: real('internalTemperature'),
    humidity: real('humidity'),
    internalHumidity: real('internalHumidity'),
    pressure: real('pressure'),
    illuminance: real('illuminance'),
    batteryVoltage: real('batteryVoltage'),
    batteryCurrent: real('batteryCurrent'),
    batteryPower: real('batteryPower'),
    batteryLevel: real('batteryLevel'),
    solarPanelVoltage: real('solarPanelVoltage'),
    solarPanelCurrent: real('solarPanelCurrent'),
    solarPanelPower: real('solarPanelPower'),
    date: timestamp('date'),
  },
  (table) => {
    return {
      dateIdx: index('date_idx').on(table.date),
    };
  },
);
