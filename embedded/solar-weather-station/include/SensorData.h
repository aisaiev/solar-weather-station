#pragma once

#include <math.h>

struct SensorData {
  float temperature = NAN;
  float humidity = NAN;
  float pressure = NAN; // hPa
  float internalTemp = NAN;
  float internalHumidity = NAN;
  float illuminance = NAN;       // lux
  float solarPanelVoltage = NAN; // V
  float solarPanelCurrent = NAN; // A
  float solarPanelPower = NAN;   // W
  float batteryVoltage = NAN;    // V
  float batteryCurrent = NAN;    // A
  float batteryPower = NAN;      // W
  float batteryLevel = NAN;      // %
  float ramUsageKb = NAN;        // KB
  float ramUsagePercent = NAN;   // %
};
