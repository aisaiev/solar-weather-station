#pragma once

#include <Arduino.h>
#include <Wire.h>

// esp-idf
#include <esp_event.h>
#include <esp_wifi.h>
#include <freertos/FreeRTOS.h>
#include <freertos/event_groups.h>

// Sensors
#include <Adafruit_BME280.h>
#include <BH1750_WE.h>
#include <INA226.h>
#include <SHTSensor.h>

// Connectivity
#include <PubSubClient.h>
#include <WiFiClient.h>

// OTA
#include <ESPAsyncWebServer.h>
#include <ElegantOTA.h>

#include "MeshtasticSerial.h"
#include "SensorData.h"
#include "config.h"

class WeatherStation {
public:
  WeatherStation();

  void begin();
  void loop();

  // Static esp_event / MQTT callbacks
  static void onWifiEvent(void *arg, esp_event_base_t base, int32_t id,
                          void *data);
  static void onIpEvent(void *arg, esp_event_base_t base, int32_t id,
                        void *data);
  static void onMqttMessage(char *topic, uint8_t *payload, unsigned int len);

private:
  static WeatherStation *s_instance; // for static callback dispatch

  EventGroupHandle_t _events = nullptr;

  Adafruit_BME280 _bme280;
  SHTSensor _sht;
  BH1750_WE _bh1750;
  INA226 _inaSolar;
  INA226 _inaBattery;
  bool _bme280Ready = false;

  WiFiClient _wifiClient;
  PubSubClient _mqtt;
  AsyncWebServer _server;
  MeshtasticSerial _meshtastic;

  void initHardware();
  void initSensors();
  bool initBme280();
  bool readBme280(SensorData &d);
  void connectWifi();
  bool connectMqtt();
  void drainMqtt(uint32_t durationMs);
  SensorData readSensors();
  void publishMeasurements(const SensorData &d);
  void runOtaMode();
  void enterDeepSleep();
  bool waitBits(EventBits_t bits, uint32_t timeoutMs);
};
