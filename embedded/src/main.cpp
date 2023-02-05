#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>
#include <Wire.h>
#include "Adafruit_SHT31.h"
#include <Adafruit_BMP280.h>
#include <Adafruit_Sensor.h>
#include "sensors_data.cpp"
#include "constants.h"

Adafruit_BMP280 bmp;
Adafruit_SHT31 sht31 = Adafruit_SHT31();

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void initMqttServer();
void connectMqtt();
void publishSensorsData();
void deepSleep();

const int wifiConnectionAttemptsCount = 5;
const int mqttConnectionAttemptsCount = 5;

const int totalEspRam = 81920;
const float minBatteryVoltage = 2.8;
const float maxBatteryVoltage = 4.2;

void setup()
{
    Serial.begin(SERIAL_BAUD);

    bmp.begin(BMP_SENSOR_I2C_ADDRESS);
    sht31.begin(SHT_SENSOR_I2C_ADDRESS);

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
    mqttClient.loop();

    deepSleep();
}

void deepSleep()
{
    Serial.println("");
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
    return bmp.readPressure() / 100.0F;
}

float getAltitude()
{
    return bmp.readAltitude(1013.25);
}

int getBatteryLevel()
{
    float batteryVoltage = getBatteryVoltage();
    return round((((batteryVoltage - minBatteryVoltage) / (maxBatteryVoltage - minBatteryVoltage)) * 100));
}

float getBatteryVoltage()
{
    return maxBatteryVoltage * ((float)analogRead(0) / 1024.0);
}

bool getBatteryCharging()
{
    return digitalRead(14) == HIGH;
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
    float batteryVoltage = getBatteryVoltage();
    int batteryLevel = getBatteryLevel();
    bool batteryCharging = getBatteryCharging();
    
    SensorsData data = { mcu, cpuFrequency, ramUsageKb, ramUsagePercent, temperature, humidity, pressure, altitude, batteryVoltage, batteryLevel, batteryCharging };

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
    json["batteryVoltage"] = data.batteryVoltage;
    json["batteryLevel"] = data.batteryLevel;
    json["batteryCharging"] = data.batteryCharging;

    return json;
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
            Serial.println("MQTT Connected");
            publishSensorsData();
            Serial.println("MQTT data has been sent");
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
    serializeJson(getSensorsDataJson(), payload);
    mqttClient.publish(MQTT_TOPIC, payload.c_str(), true);
}
