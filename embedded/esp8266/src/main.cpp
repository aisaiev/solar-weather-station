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
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncElegantOTA.h>
#include <LittleFS.h>
#include "sensors_data.cpp"
#include "secrets.h"
#include "constants.h"
#include "Config.cpp"

#define VEML6070_RSET_DEFAULT 270000
#define VEML6070_UV_MAX_INDEX 15
#define VEML6070_UV_MAX_DEFAULT 11
#define VEML6070_POWER_COEFFCIENT 0.025f
#define VEML6070_TABLE_COEFFCIENT 32.86270591f
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

AsyncWebServer server(80);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

Config config;

DynamicJsonDocument getConfigJson();
Config getConfig();
void saveConfig(DynamicJsonDocument json);
void initWebServer();
void initMqttServer();
void connectMqtt();
void uvTableInit();
void publishSensorsData();
void manageRelay();
void turnOnRelay();
void turnOffRelay();
void deepSleep();
void deepSleepWithDelay();
int readMux(int channel);

const int wifiConnectionAttemptsCount = 5;
const int mqttConnectionAttemptsCount = 5;
const int measureInterval = 600000; // 10 minutes
long lastMeasureTime = 0;
float temperature = 0;
bool isFirstRun = true;
bool keepAlive = false;
bool restartEsp = false;
bool performDeepSleepWithDelay = false;
long deepSleepWithDelayStartTime = 0;
const int deepSleepWithDelayDuration = 5000;

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
    LittleFS.begin();
    Wire.begin();

    config = getConfig();

    bmp280.begin(BMP_SENSOR_I2C_ADDRESS);
    sht31.begin(SHT_SENSOR_I2C_ADDRESS);
    veml6070.begin(VEML6070_4_T);
    bh1750.begin(BH1750::ONE_TIME_HIGH_RES_MODE);
    initWebServer();
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(MUX_PIN_S0, OUTPUT);
    pinMode(MUX_PIN_S1, OUTPUT);
    pinMode(MUX_PIN_S2, OUTPUT);
    pinMode(MUX_PIN_S3, OUTPUT);

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
    mqttClient.loop();

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

    if (performDeepSleepWithDelay)
    {
        deepSleepWithDelay();
    }

    if (restartEsp)
    {
        ESP.restart();
    }
}

void deepSleepWithDelay()
{
    long currentTime = millis();
    if (currentTime - deepSleepWithDelayStartTime > deepSleepWithDelayDuration)
    {
        deepSleep();
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
    int value = readMux(0) * 1.0022;
    return maxBatteryVoltage * ((float)value / 1024.0);
}

int getBatteryLevel(float batteryVoltage)
{
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
    veml6070.sleep(false);
    uint16_t value = veml6070.readUV();
    veml6070.sleep(true);
    return value;
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

int getRainAnalog()
{
    return readMux(1);
}

int readMux(int channel)
{
    int controlPin[] = {MUX_PIN_S0, MUX_PIN_S1, MUX_PIN_S2, MUX_PIN_S3};

    int muxChannel[16][4] = {
        {0, 0, 0, 0},
        {1, 0, 0, 0},
        {0, 1, 0, 0},
        {1, 1, 0, 0},
        {0, 0, 1, 0},
        {1, 0, 1, 0},
        {0, 1, 1, 0},
        {1, 1, 1, 0},
        {0, 0, 0, 1},
        {1, 0, 0, 1},
        {0, 1, 0, 1},
        {1, 1, 0, 1},
        {0, 0, 1, 1},
        {1, 0, 1, 1},
        {0, 1, 1, 1},
        {1, 1, 1, 1}};

    for (int i = 0; i < 4; i++)
    {
        digitalWrite(controlPin[i], muxChannel[channel][i]);
    }

    return analogRead(A0);
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
    int rainAnalog = getRainAnalog();
    float batteryVoltage = getBatteryVoltage();
    int batteryLevel = getBatteryLevel(batteryVoltage);
    bool batteryCharging = getBatteryCharging();

    SensorsData data = {mcu, cpuFrequency, ramUsageKb, ramUsagePercent, temperature, humidity, pressure, altitude, uvLevel, uvRisk, uvIndex, uvPower, illuminance, rainAnalog, batteryVoltage, batteryLevel, batteryCharging};

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
    json["rainAnalog"] = data.rainAnalog;
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
    if (temperature > config.temperatureThreshold)
    {
        turnOnRelay();
    }
    else
    {
        turnOffRelay();
        if (!keepAlive)
        {
            performDeepSleepWithDelay = true;
            deepSleepWithDelayStartTime = millis();
        }
    }
}

//=====================
// MQTT
//=====================

void initMqttServer()
{
    mqttClient.setBufferSize(512);
    mqttClient.setServer(MQTT_HOST, MQTT_PORT);
    mqttClient.setCallback([](char *topic, byte *payload, unsigned int length) {
        if (strcmp(topic, MQTT_KEEP_ALIVE_TOPIC) == 0)
        {
            if (length == 1)
            {
                if ((char)payload[0] == '1')
                {
                    keepAlive = true;
                }
                else if ((char)payload[0] == '0')
                {
                    keepAlive = false;
                }
            }
        }
    });
}

void connectMqtt()
{
    int mqttConnectionAttempts = 0;
    while (!mqttClient.connected() && mqttConnectionAttempts <= mqttConnectionAttemptsCount)
    {
        Serial.println("Connecting to MQTT broker...");
        if (mqttClient.connect(MQTT_CLIENT_ID))
        {
            mqttClient.subscribe(MQTT_KEEP_ALIVE_TOPIC);
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

//=====================
// STATE
//=====================

DynamicJsonDocument getStateJson()
{
    DynamicJsonDocument json(32);
    json["isRelayOn"] = digitalRead(RELAY_PIN) == HIGH;
    return json;
}

//=====================
// SERVER
//=====================

void initWebServer()
{
    server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html").setCacheControl("max-age=600");

    server.on("/api/state", HTTP_GET, [](AsyncWebServerRequest *request)
    {
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        DynamicJsonDocument json = getStateJson();
        serializeJson(json, *response);
        request->send(response);
    });

    server.on("/api/relay/on", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total)
    {
        turnOnRelay();
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        StaticJsonDocument<16> respJson;
        respJson["status"] = "ok";
        serializeJson(respJson, *response);
        request->send(response);
    });

    server.on("/api/relay/off", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total)
    {
        turnOffRelay();
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        StaticJsonDocument<16> respJson;
        respJson["status"] = "ok";
        serializeJson(respJson, *response);
        request->send(response);
    });

    server.on("/api/config", HTTP_GET, [](AsyncWebServerRequest *request)
    {
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        DynamicJsonDocument json = getConfigJson();
        serializeJson(json, *response);
        request->send(response);
    });

    server.on("/api/config", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total)
    {
        DynamicJsonDocument json(512);
        deserializeJson(json, data);
        saveConfig(json);

        AsyncResponseStream *response = request->beginResponseStream("application/json");
        StaticJsonDocument<16> respJson;
        respJson["status"] = "ok";
        serializeJson(respJson, *response);
        request->send(response);
    });

    server.on("/api/restart", HTTP_POST, [](AsyncWebServerRequest *request) {}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total)
    {
        AsyncResponseStream *response = request->beginResponseStream("application/json");
        StaticJsonDocument<16> respJson;
        respJson["status"] = "ok";
        serializeJson(respJson, *response);
        request->send(response);
        restartEsp = true;
    });

    server.onNotFound([](AsyncWebServerRequest *request)
    {
        request->redirect("/");
    });

    AsyncElegantOTA.begin(&server);
    server.begin();
}

//=====================
// CONFIG
//=====================

DynamicJsonDocument getConfigJson()
{
  File configFile = LittleFS.open("/config.json", "r");
  DynamicJsonDocument json(512);
  deserializeJson(json, configFile);
  return json;
}

Config getConfig()
{
  File configFile = LittleFS.open("/config.json", "r");
  DynamicJsonDocument json(512);
  deserializeJson(json, configFile);
  Config config = { json["temperatureThreshold"] };
  return config;
}

void saveConfig(DynamicJsonDocument json)
{
  File configFile = LittleFS.open("/config.json", "w");
  serializeJson(json, configFile);
}