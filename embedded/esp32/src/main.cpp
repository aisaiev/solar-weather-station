#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <Wire.h>
#include <AsyncTCP.h>
#include <AsyncElegantOTA.h>
#include <PubSubClient.h>
#include <SHT3x.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include "secrets.h"
#include "constants.h"
#include "weather_data.cpp"

AsyncWebServer server(80);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

Adafruit_BME280 bme;
BH1750 bh1750;
SHT3x sht3x;

long previousTime = 0;
long executeDeepSleepStartTime = 0;
bool isExecuteDeepSleep = false;
bool keepAlive = false;

void deepSleep();
void executeDeepSleepWithDelay();
void connectToWiFi();
void initWebServer();
void initMqtt();
void connectMqtt();
void publishWeatherData();
WeatherData getWeatherData();
DynamicJsonDocument getWeatherDataJson();

void setup()
{
    // Serial.begin(115200); // For debugging only, do not use in production!

    pinMode(OPTOCOUPLER_PIN, OUTPUT);
    digitalWrite(OPTOCOUPLER_PIN, HIGH);
    delay(1000);

    setCpuFrequencyMhz(80);

    Wire.begin(SDA_PIN, SCL_PIN);
    sht3x.Begin();
    bme.begin(BME280_ADDRESS_ALTERNATE);
    bh1750.begin(BH1750::ONE_TIME_HIGH_RES_MODE);

    connectToWiFi();
    initWebServer();
    initMqtt();
}

void loop()
{
    sht3x.UpdateData();
    if (!mqttClient.connected())
    {
        connectMqtt();
    }
    mqttClient.loop();

    long currentTime = millis();
    if (currentTime - previousTime > PUBLISH_WEATHER_DATA_DELAY_MILLISECONDS)
    {
        previousTime = currentTime;
        publishWeatherData();

        if (!keepAlive)
        {
            isExecuteDeepSleep = true;
            executeDeepSleepStartTime = millis();
        }
    }

    if (isExecuteDeepSleep)
    {
        executeDeepSleepWithDelay();
    }
    
}

//=====================
// WIFI
//=====================
void connectToWiFi()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    byte wifiConnectionAttemptCount = 0;
    while (WiFi.status() != WL_CONNECTED && wifiConnectionAttemptCount <= WIFI_CONNECTION_ATTEMPT_COUNT)
    {
        delay(1000);
        Serial.println("Connecting to WiFi..");

        if (wifiConnectionAttemptCount == WIFI_CONNECTION_ATTEMPT_COUNT)
        {
            deepSleep();
        }

        wifiConnectionAttemptCount++;
    }

    Serial.println("Connected to Wi-Fi " + String(WIFI_SSID));
    Serial.println("IP address " + WiFi.localIP().toString());

    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);
}

//=====================
// MQTT
//=====================
void initMqtt()
{
    mqttClient.setBufferSize(512);
    mqttClient.setServer(MQTT_HOST, MQTT_PORT);
    mqttClient.setCallback([](char *topic, byte *payload, unsigned int length)
    {
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
    while (!mqttClient.connected() && mqttConnectionAttempts <= MQTT_CONNECTION_ATTEMPT_COUNT)
    {
        Serial.println("Connecting to MQTT broker...");
        if (mqttClient.connect(MQTT_CLIENT_ID))
        {
            mqttClient.subscribe(MQTT_KEEP_ALIVE_TOPIC);
            Serial.println("Connected to MQTT broker");
        }
        else
        {
            Serial.println("Unable connect to MQTT broker");
            delay(1000);

            if (mqttConnectionAttempts == MQTT_CONNECTION_ATTEMPT_COUNT)
            {
                deepSleep();
            }
        }
        mqttConnectionAttempts++;
    }
}

void publishWeatherData()
{
    String payload;
    DynamicJsonDocument json = getWeatherDataJson();
    serializeJson(json, payload);
    mqttClient.publish(MQTT_TOPIC, payload.c_str(), false);
    Serial.println("Published weather data");
}

//=====================
// WEB SERVER
//=====================

void initWebServer()
{
    AsyncElegantOTA.begin(&server);
    server.begin();
}

//=====================
// DEEP SLEEP
//=====================
void deepSleep()
{
    Serial.println("Going to deep sleep...");
    Serial.flush();

    esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH,   ESP_PD_OPTION_OFF);
    esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_SLOW_MEM, ESP_PD_OPTION_OFF);
    esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_FAST_MEM, ESP_PD_OPTION_OFF);
    esp_sleep_pd_config(ESP_PD_DOMAIN_XTAL,         ESP_PD_OPTION_OFF);

    esp_sleep_enable_timer_wakeup(DEEP_SLEEP_SECONDS * 1000000);
    esp_deep_sleep_start();
}

void executeDeepSleepWithDelay()
{
    long currentTime = millis();
    if (currentTime - executeDeepSleepStartTime > DEEP_SLEEP_DELAY_MILLISECONDS)
    {
        isExecuteDeepSleep = false;
        deepSleep();
    }
}

//=====================
// SENSORS
//=====================
String getMcuName()
{
    return MCU_NAME;
}

int getCpuFrequency()
{
    return CPU_FREQUENCY;
}

float getRamUsageKb()
{
    int ramUsage = TOTAL_ESP_RAM - ESP.getFreeHeap();
    return (float)ramUsage / 1000;
}

float getRamUsagePercent()
{
    int ramUsage = TOTAL_ESP_RAM - ESP.getFreeHeap();
    return (float)ramUsage / TOTAL_ESP_RAM * 100;
}

float getTemperature()
{
    return bme.readTemperature();
}

float getInternalTemperature()
{
    return sht3x.GetTemperature();
}

float getHumidity()
{
    return bme.readHumidity();
}

float getInternalHumidity()
{
    return sht3x.GetRelHumidity();
}

float getPressure()
{
    return bme.readPressure() / 100.0F;
}

float getIlluminance()
{
    return bh1750.readLightLevel();
}

float getBatteryVoltage()
{
    int analogValue = analogRead(BATTERY_ANALOG_PIN);
    const float coefficient = 1.055;
    float voltage = (analogValue * (3.3 / 4095.0) * 2) * coefficient;
    return voltage;
}

int getBatteryLevel()
{
    float voltage = getBatteryVoltage();
    return round((((voltage - 2.8) / (4.2 - 2.8)) * 100));
}

WeatherData getWeatherData()
{
    String mcu = getMcuName();
    int cpuFrequency = getCpuFrequency();
    float ramUsageKb = getRamUsageKb();
    float ramUsagePercent = getRamUsagePercent();
    float temperature = getTemperature();
    float humidity = getHumidity();
    float internalTemperature = getInternalTemperature();
    float internalHumidity = getInternalHumidity();
    float pressure = getPressure();
    float illuminance = getIlluminance();
    float batteryVoltage = getBatteryVoltage();
    int batteryLevel = getBatteryLevel();

    WeatherData data = {
        mcu,
        cpuFrequency,
        ramUsageKb,
        ramUsagePercent,
        temperature,
        humidity,
        internalTemperature,
        internalHumidity,
        pressure,
        illuminance,
        batteryVoltage,
        batteryLevel
    };

    return data;
}

DynamicJsonDocument getWeatherDataJson()
{
    WeatherData data = getWeatherData();

    DynamicJsonDocument doc(1024);
    doc["mcu"] = data.mcu;
    doc["cpuFrequency"] = data.cpuFrequency;
    doc["ramUsageKb"] = data.ramUsageKb;
    doc["ramUsagePercent"] = data.ramUsagePercent;
    doc["temperature"] = data.temperature;
    doc["humidity"] = data.humidity;
    doc["internalTemperature"] = data.internalTemperature;
    doc["internalHumidity"] = data.internalHumidity;
    doc["pressure"] = data.pressure;
    doc["illuminance"] = data.illuminance;
    doc["batteryVoltage"] = data.batteryVoltage;
    doc["batteryLevel"] = data.batteryLevel;

    return doc;
}
