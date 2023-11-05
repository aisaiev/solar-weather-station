#include <Arduino.h>

struct WeatherData
{
    String mcu;
    int cpuFrequency;
    float ramUsageKb;
    float ramUsagePercent;
    float temperature;
    float humidity;
    float internalTemperature;
    float internalHumidity;
    float pressure;
    float illuminance;
    float batteryVoltage;
    int batteryLevel;
};