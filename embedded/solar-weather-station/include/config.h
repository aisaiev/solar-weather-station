#pragma once

#include <INA226.h> // for ina226_average_enum
#include <freertos/FreeRTOS.h>
#include <freertos/event_groups.h>
#include <stdint.h>

// ─── Pins
// ─────────────────────────────────────────────────────────────────────

static constexpr uint8_t PIN_SENSOR_PWR =
    5; // Sensor VCC rail powered directly from GPIO 5: HIGH = ON
static constexpr uint8_t I2C_SDA = 1;
static constexpr uint8_t I2C_SCL = 2;

// ─── Heltec V3 Meshtastic node
// ────────────────────────────────────────────────

// ESP32-S3 GPIO6 → Heltec V3 RST (100ms LOW pulse reboots/wakes Heltec)
static constexpr uint8_t HELTEC_WAKE_PIN = 6;
// ESP32-S3 UART2: GPIO17=TX → Heltec GPIO4 (Serial Module RXD)
//                 GPIO18=RX ← Heltec GPIO5 (Serial Module TXD)
static constexpr uint8_t HELTEC_SERIAL_TX = 17;
static constexpr uint8_t HELTEC_SERIAL_RX = 18;
// Time to wait after RST pulse for Meshtastic to fully boot (ms)
static constexpr uint32_t HELTEC_BOOT_WAIT_MS = 12000;
// Time to wait after sending telemetry for Heltec to LoRa-transmit (ms)
static constexpr uint32_t HELTEC_TX_WAIT_MS = 4000;
// Seconds Meshtastic waits before shutting down after AdminMessage shutdown
static constexpr uint32_t HELTEC_SHUTDOWN_SECONDS = 10;

// ─── INA226
// ───────────────────────────────────────────────────────────────────

static constexpr uint8_t INA226_ADDR_SOLAR = 0x40;
static constexpr uint8_t INA226_ADDR_BATTERY = 0x41;
static constexpr float INA226_SHUNT_OHM = 0.002f;
// 16 samples per conversion (~18ms) — improves current reading accuracy
static constexpr ina226_average_enum INA226_AVG = INA226_16_SAMPLES;

// ─── Battery
// ──────────────────────────────────────────────────────────────────

static constexpr float BATTERY_VOLTAGE_MIN = 2.8f;
static constexpr float BATTERY_VOLTAGE_MAX = 4.2f;

// ─── Timing
// ───────────────────────────────────────────────────────────────────

static constexpr uint32_t WIFI_TIMEOUT_MS = 15000;
static constexpr uint32_t MQTT_TIMEOUT_MS = 5000;
static constexpr uint32_t OTA_CHECK_MS = 500;
static constexpr uint64_t SLEEP_DURATION_US = 5ULL * 60 * 1000000; // 5 minutes

// ─── BME280 recovery
// ────────────────────────────────────────────────────────────────

static constexpr uint32_t SENSOR_POWER_SETTLE_MS = 250;
static constexpr uint8_t BME280_INIT_ATTEMPTS = 3;
static constexpr uint32_t BME280_INIT_RETRY_MS = 150;
static constexpr uint8_t BME280_READ_ATTEMPTS = 3;
static constexpr uint32_t BME280_READ_RETRY_MS = 250;

// ─── Web server
// ───────────────────────────────────────────────────────────────

static constexpr uint16_t WEB_SERVER_PORT = 80;

// ─── MQTT
// ─────────────────────────────────────────────────────────────────────

static constexpr const char *MQTT_CLIENT_ID = "solar-weather-station";
static constexpr const char *MQTT_TOPIC_AVAIL =
    "solar-weather-station/availability";
static constexpr const char *MQTT_TOPIC_MEASUREMENTS =
    "solar-weather-station/measurements";
static constexpr const char *MQTT_TOPIC_OTA_MODE =
    "solar-weather-station/ota_mode";
static constexpr const char *MQTT_TOPIC_SLEEP_MODE =
    "solar-weather-station/sleep_mode";
static constexpr const char *MQTT_PAYLOAD_ONLINE = "online";
static constexpr const char *MQTT_PAYLOAD_OFFLINE = "offline";

// ─── FreeRTOS EventGroup bits
// ─────────────────────────────────────────────────

static constexpr EventBits_t EVT_WIFI_READY = BIT0;
static constexpr EventBits_t EVT_MQTT_READY = BIT1;
static constexpr EventBits_t EVT_OTA_MODE = BIT2;
