#include <Arduino.h>

struct SensorsData
{
    String mcu;
    float cpuFrequency;
    float ramUsageKb;
    float ramUsagePercent;
    float temperature;
    float humidity;
    float pressure;
    float altitude;
    int uvLevel;
    float uvRisk;
    int uvIndex;
    float uvPower;
    float illuminance;
    int rainAnalog;
    float batteryVoltage;
    int batteryLevel;
    bool batteryCharging;
};
