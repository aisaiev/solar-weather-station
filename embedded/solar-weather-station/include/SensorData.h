#pragma once

#include <math.h>

struct SensorData {
    float temperature      = NAN;
    float humidity         = NAN;
    float pressure         = NAN; // hPa
    float internalTemp     = NAN;
    float internalHumidity = NAN;
    float illuminance      = NAN; // lux
    float solarVoltage     = NAN; // V
    float solarCurrent     = NAN; // A
    float solarPower       = NAN; // W
    float batteryVoltage   = NAN; // V
    float batteryCurrent   = NAN; // A
    float batteryPower     = NAN; // W
    float batteryLevel     = NAN; // %
};
