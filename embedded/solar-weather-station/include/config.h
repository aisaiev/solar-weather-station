#pragma once

#include <stdint.h>
#include <freertos/FreeRTOS.h>
#include <freertos/event_groups.h>
#include <INA226.h> // for ina226_average_enum

// ─── Pins ─────────────────────────────────────────────────────────────────────

static constexpr uint8_t PIN_MOSFET = 5; // N-MOSFET gate on sensor ground rail: HIGH = ON
static constexpr uint8_t I2C_SDA    = 1;
static constexpr uint8_t I2C_SCL    = 2;

// ─── INA226 ───────────────────────────────────────────────────────────────────

static constexpr uint8_t  INA226_ADDR_SOLAR   = 0x40;
static constexpr uint8_t  INA226_ADDR_BATTERY = 0x41;
static constexpr float    INA226_SHUNT_OHM    = 0.002f;
// 16 samples per conversion (~18ms) — improves current reading accuracy
static constexpr ina226_average_enum INA226_AVG = INA226_16_SAMPLES;

// ─── Battery ──────────────────────────────────────────────────────────────────

static constexpr float BATTERY_VOLTAGE_MIN = 2.8f;
static constexpr float BATTERY_VOLTAGE_MAX = 4.2f;

// ─── Timing ───────────────────────────────────────────────────────────────────

static constexpr uint32_t WIFI_TIMEOUT_MS   = 15000;
static constexpr uint32_t MQTT_TIMEOUT_MS   = 5000;
static constexpr uint32_t OTA_CHECK_MS      = 500;
static constexpr uint64_t SLEEP_DURATION_US = 5ULL * 60 * 1000000; // 5 minutes

// ─── Web server ───────────────────────────────────────────────────────────────

static constexpr uint16_t WEB_SERVER_PORT = 80;

// ─── MQTT ─────────────────────────────────────────────────────────────────────

static constexpr const char* MQTT_CLIENT_ID         = "solar-weather-station";
static constexpr const char* MQTT_TOPIC_AVAIL        = "solar-weather-station/availability";
static constexpr const char* MQTT_TOPIC_MEASUREMENTS = "solar-weather-station/measurements";
static constexpr const char* MQTT_TOPIC_OTA_MODE     = "solar-weather-station/ota_mode";
static constexpr const char* MQTT_TOPIC_SLEEP_MODE   = "solar-weather-station/sleep_mode";
static constexpr const char* MQTT_PAYLOAD_ONLINE     = "online";
static constexpr const char* MQTT_PAYLOAD_OFFLINE    = "offline";

// ─── FreeRTOS EventGroup bits ─────────────────────────────────────────────────

static constexpr EventBits_t EVT_WIFI_READY = BIT0;
static constexpr EventBits_t EVT_MQTT_READY = BIT1;
static constexpr EventBits_t EVT_OTA_MODE   = BIT2;
