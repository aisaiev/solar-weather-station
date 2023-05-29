#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>
#include <Wire.h>
#include "Adafruit_SHT31.h"
#include <Adafruit_BMP280.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_VEML6070.h>
#include <BH1750.h>
#include "sensors_data.cpp"
#include "constants.h"

#define VEML6070_RSET_DEFAULT 270000
#define VEML6070_UV_MAX_INDEX 15
#define VEML6070_UV_MAX_DEFAULT 11
#define VEML6070_POWER_COEFFCIENT 0.025
#define VEML6070_TABLE_COEFFCIENT 32.86270591
#define UV_INDEX_1 1 // sun->fun
#define UV_INDEX_2 2 // sun->glases advised
#define UV_INDEX_3 3 // sun->glases a must
#define UV_INDEX_4 4 // sun->skin burns Level 1
#define UV_INDEX_5 5 // sun->skin burns level 1..2
#define UV_INDEX_6 6 // sun->skin burns with level 3
#define UV_INDEX_7 7 // out of range or unknown

BH1750 bh1750;
Adafruit_BMP280 bmp280;
Adafruit_SHT31 sht31 = Adafruit_SHT31();
Adafruit_VEML6070 veml6070 = Adafruit_VEML6070();

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void initMqttServer();
void connectMqtt();
void uvTableInit();
void publishSensorsData();
void manageRelay();
void turnOnRelay();
void turnOffRelay();
void deepSleep();

const int wifiConnectionAttemptsCount = 5;
const int mqttConnectionAttemptsCount = 5;
const int measureInterval = 600000; // 10 minutes
long lastMeasureTime = 0;
float temperature = 0;
float temperatureThreshold = 40;
bool isFirstRun = true;

const int totalEspRam = 81920;
const float minBatteryVoltage = 2.8;
const float maxBatteryVoltage = 4.2;
float uvRiskMap[VEML6070_UV_MAX_INDEX] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
struct UvRisk
{
    float risk;
    int index;
};

void setup()
{
    Serial.begin(SERIAL_BAUD);
    Wire.begin();

    bmp280.begin(BMP_SENSOR_I2C_ADDRESS);
    sht31.begin(SHT_SENSOR_I2C_ADDRESS);
    veml6070.begin(VEML6070_4_T);
    bh1750.begin(BH1750::ONE_TIME_HIGH_RES_MODE);
    pinMode(RELAY_PIN, OUTPUT);

    uvTableInit();

    Serial.println("");
    Serial.println("Wi-Fi SSID " + String(WIFI_SSID));
    Serial.println("Wi-Fi PSWD " + String(WIFI_PASSWORD));
    Serial.print("Connecting to Wi-Fi");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int wifiConnectionAttempts = 0;
    while (WiFi.status() != WL_CONNECTED && wifiConnectionAttempts <= wifiConnectionAttemptsCount)
    {
        delay(5000);
        Serial.print(".");

        if (wifiConnectionAttempts == wifiConnectionAttemptsCount)
        {
            deepSleep();
        }
        wifiConnectionAttempts++;
    }

    Serial.println("");
    Serial.println("Connected to Wi-Fi " + String(WIFI_SSID));
    Serial.println("IP address " + WiFi.localIP().toString());

    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);

    initMqttServer();
}

void loop()
{
    if (!mqttClient.connected())
    {
        connectMqtt();
    }

    if (isFirstRun)
    {
        publishSensorsData();
        mqttClient.loop();
        manageRelay();
        isFirstRun = false;
    }
    
    long currentTime = millis();
    if (currentTime - lastMeasureTime > measureInterval)
    {
        lastMeasureTime = currentTime;

        publishSensorsData();
        mqttClient.loop();
        manageRelay();
    }
}

void deepSleep()
{
    Serial.println("Going to deep sleep");
    ESP.deepSleep(SLEEP_DURATION);
}

//=====================
// SENSORS
//=====================
String getMcuName()
{
    return "ESP8266EX";
}

float getCpuFrequency()
{
    return 80.0;
}

float getRamUsageKb()
{
    int ramUsage = totalEspRam - ESP.getFreeHeap();
    return (float)ramUsage / 1000;
}

float getRamUsagePercent()
{
    int ramUsage = totalEspRam - ESP.getFreeHeap();
    return (float)ramUsage / totalEspRam * 100;
}

float getTemperature()
{
    return sht31.readTemperature();
}

float getHumidity()
{
    return sht31.readHumidity();
}

float getPressure()
{
    return bmp280.readPressure() / 100.0F;
}

float getAltitude()
{
    return bmp280.readAltitude(1013.25);
}

float getBatteryVoltage()
{
    return maxBatteryVoltage * ((float)analogRead(0) / 1024.0);
}

int getBatteryLevel()
{
    float batteryVoltage = getBatteryVoltage();
    return round((((batteryVoltage - minBatteryVoltage) / (maxBatteryVoltage - minBatteryVoltage)) * 100));
}

bool getBatteryCharging()
{
    return digitalRead(14) == HIGH;
}

void uvTableInit()
{
    for (uint32_t i = 0; i < VEML6070_UV_MAX_INDEX; i++)
    {
        uvRiskMap[i] = ((VEML6070_RSET_DEFAULT / VEML6070_TABLE_COEFFCIENT) / VEML6070_UV_MAX_DEFAULT) * (i + 1);
    }
}

uint16_t getUvLevel()
{
    return veml6070.readUV();
}

UvRisk getUvRiskLevel(uint16_t uvLevel)
{
    float risk = 0;
    int uvIndex = 0;
    if (uvLevel < uvRiskMap[VEML6070_UV_MAX_INDEX - 1])
    {
        risk = (float)uvLevel / uvRiskMap[0];
        if ((risk >= 0) && (risk <= 2.9))
        {
            uvIndex = UV_INDEX_1;
        }
        else if ((risk >= 3.0) && (risk <= 5.9))
        {
            uvIndex = UV_INDEX_2;
        }
        else if ((risk >= 6.0) && (risk <= 7.9))
        {
            uvIndex = UV_INDEX_3;
        }
        else if ((risk >= 8.0) && (risk <= 10.9))
        {
            uvIndex = UV_INDEX_4;
        }
        else if ((risk >= 11.0) && (risk <= 12.9))
        {
            uvIndex = UV_INDEX_5;
        }
        else if ((risk >= 13.0) && (risk <= 25.0))
        {
            uvIndex = UV_INDEX_6;
        }
        else
        {
            uvIndex = UV_INDEX_7;
        }
        return (UvRisk){risk, uvIndex};
    }
    else
    {
        risk = 99;
        uvIndex = UV_INDEX_7;
        return (UvRisk){risk, uvIndex};
    }
}

float getUvPower(float uvRisk)
{
    float power = 0;
    return (power = VEML6070_POWER_COEFFCIENT * uvRisk);
}

float getIlluminance()
{
    return bh1750.readLightLevel();
}

SensorsData getSensorsData()
{
    String mcu = getMcuName();
    float cpuFrequency = getCpuFrequency();
    float ramUsageKb = getRamUsageKb();
    float ramUsagePercent = getRamUsagePercent();
    float temperature = getTemperature();
    float humidity = getHumidity();
    float pressure = getPressure();
    float altitude = getAltitude();
    int uvLevel = getUvLevel();
    UvRisk _uvRisk = getUvRiskLevel(uvLevel);
    float uvRisk = _uvRisk.risk;
    int uvIndex = _uvRisk.index;
    float uvPower = getUvPower(uvRisk);
    float illuminance = getIlluminance();
    float batteryVoltage = getBatteryVoltage();
    int batteryLevel = getBatteryLevel();
    bool batteryCharging = getBatteryCharging();

    SensorsData data = {mcu, cpuFrequency, ramUsageKb, ramUsagePercent, temperature, humidity, pressure, altitude, uvLevel, uvRisk, uvIndex, uvPower, illuminance, batteryVoltage, batteryLevel, batteryCharging};

    return data;
}

DynamicJsonDocument getSensorsDataJson()
{
    SensorsData data = getSensorsData();

    DynamicJsonDocument json(512);
    json["mcu"] = data.mcu;
    json["cpuFrequency"] = data.cpuFrequency;
    json["ramUsageKb"] = data.ramUsageKb;
    json["ramUsagePercent"] = data.ramUsagePercent;
    json["temperature"] = data.temperature;
    json["humidity"] = data.humidity;
    json["pressure"] = data.pressure;
    json["altitude"] = data.altitude;
    json["uvLevel"] = data.uvLevel;
    json["uvRisk"] = data.uvRisk;
    json["uvIndex"] = data.uvIndex;
    json["uvPower"] = data.uvPower;
    json["illuminance"] = data.illuminance;
    json["batteryVoltage"] = data.batteryVoltage;
    json["batteryLevel"] = data.batteryLevel;
    json["batteryCharging"] = data.batteryCharging;

    return json;
}

void turnOnRelay()
{
    Serial.println("Turning on relay");
    digitalWrite(RELAY_PIN, HIGH);
}

void turnOffRelay()
{
    Serial.println("Turning off relay");
    digitalWrite(RELAY_PIN, LOW);
}

void manageRelay()
{
    if (temperature > temperatureThreshold)
    {
        turnOnRelay();
    }
    else
    {
        turnOffRelay();
        deepSleep();
    }
}

//=====================
// MQTT
//=====================
void initMqttServer()
{
    mqttClient.setBufferSize(512);
    mqttClient.setServer(MQTT_HOST, MQTT_PORT);
}

void connectMqtt()
{
    int mqttConnectionAttempts = 0;
    while (!mqttClient.connected() && mqttConnectionAttempts <= mqttConnectionAttemptsCount)
    {
        Serial.println("Connecting to MQTT broker...");
        if (mqttClient.connect(MQTT_CLIENT_ID))
        {
            Serial.println("Connected to MQTT broker");
        }
        else
        {
            Serial.println("Unable connect to MQTT");
            delay(5000);

            if (mqttConnectionAttempts == mqttConnectionAttemptsCount)
            {
                deepSleep();
            }
        }
        mqttConnectionAttempts++;
    }
}

void publishSensorsData()
{
    String payload;
    DynamicJsonDocument json = getSensorsDataJson();
    temperature = json["temperature"];
    serializeJson(json, payload);
    mqttClient.publish(MQTT_TOPIC, payload.c_str(), false);
    Serial.println("MQTT data has been sent");
}
