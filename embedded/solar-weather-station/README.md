# Solar Weather Station — Firmware

ESP32-S3 firmware for a solar-powered weather station. Reads environmental and power sensors over I2C, publishes a JSON payload to MQTT, and transmits environment telemetry to a Heltec V3 Meshtastic node over serial UART. Then enters deep sleep. OTA updates are supported via a retained MQTT trigger.

## Hardware

| Component | Interface | Address / Pin |
|-----------|-----------|---------|
| BME280 (temperature, humidity, pressure) | I2C | 0x76 |
| SHT3x (internal temperature, humidity) | I2C | default |
| BH1750 (illuminance) | I2C | 0x23 |
| INA226 — solar panel (voltage, current, power) | I2C | 0x40 |
| INA226 — battery (voltage, current, power, level) | I2C | 0x41 |
| GPIO 5 (sensor VCC rail) | GPIO 5 | — |
| Heltec WiFi LoRa 32 V3 (Meshtastic node) | UART2 | GPIO 17 TX / GPIO 18 RX |

**I2C pins:** SDA = GPIO 1, SCL = GPIO 2  
**MOSFET pin:** GPIO 5 — driven HIGH to supply sensor VCC directly, powering all sensors ON.

### Heltec V3 wiring

| ESP32-S3 | Heltec V3 | Notes |
|----------|-----------|-------|
| GPIO 17 (TX) | GPIO 4 (RXD) | Serial Module RXD |
| GPIO 18 (RX) | GPIO 5 (TXD) | Serial Module TXD |
| GPIO 6 | RST / EN | 100–220 Ω series resistor; **battery power only** — USB interferes with the CP2102 auto-reset circuit |
| GND | GND | Common ground required |

**Meshtastic Serial Module settings (one-time, via app or CLI):**
- Mode: `PROTO`, Baud: `115200`, RXD: `4`, TXD: `5`
- Disable environment telemetry on the Heltec itself to avoid duplicate readings

## Wake Cycle

```
Boot
 ├─ MOSFET ON → I2C init → sensor init
 ├─ WiFi connect (async)
 ├─ Heltec RST pulse (500 ms LOW) → wait 12 s for Meshtastic boot
 │    └─ overlaps with WiFi association — no extra latency in typical case
 ├─ WiFi ready → MQTT connect → subscribe to ota_mode + sleep_mode
 ├─ Drain retained messages (500 ms)
 │   ├─ [ota_mode = ON] → clear retained flag → start OTA web server → loop forever
 │   └─ [no OTA] → read sensors
 │       ├─ publish JSON to MQTT
 │       ├─ send Meshtastic environment telemetry over UART2 (PROTO framing)
 │       ├─ send AdminMessage shutdown_seconds → Heltec goes to sleep in 10 s
 │       ├─ wait 4 s (Heltec LoRa TX window)
 │       └─ ESP32-S3 deep sleep (GPIO 6 held HIGH to keep Heltec RST deasserted)
```

Active time is typically 15–20 seconds per cycle (dominated by the 12 s Meshtastic boot wait).

## MQTT Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `solar-weather-station/availability` | publish | `online` on connect, `offline` as will (both retained) |
| `solar-weather-station/measurements` | publish | JSON payload with all sensor readings |
| `solar-weather-station/ota_mode` | subscribe | Set to `ON` with retain to trigger OTA on next wake |
| `solar-weather-station/sleep_mode` | subscribe | Set to `ON` to force immediate deep sleep |

## Measurements Payload

```json
{
  "mcu": "ESP32-S3",
  "cpuFrequency": 240,
  "temperature": 23.4,
  "humidity": 55.1,
  "pressure": 1013.2,
  "internalTemperature": 31.0,
  "internalHumidity": 48.3,
  "illuminance": 12500.0,
  "solarPanelVoltage": 18.2,
  "solarPanelCurrent": 0.34,
  "solarPanelPower": 6.18,
  "batteryVoltage": 3.95,
  "batteryCurrent": 0.21,
  "batteryPower": 0.83,
  "batteryLevel": 82.0
}
```

Fields from failed sensors are published as `null` rather than omitting the measurement cycle entirely.

## OTA Updates

1. Publish `ON` with retain to `solar-weather-station/ota_mode`:
   ```sh
   mosquitto_pub -h <broker> -t "solar-weather-station/ota_mode" -m "ON" -r
   ```
2. Wait for the next wake cycle. The device receives the retained message on subscribe, clears the flag, and starts the web server.
3. Open `http://<device-ip>/update` and upload the new firmware binary.
4. After flashing the device reboots and resumes normal sleep cycles.

To cancel OTA mode without flashing, clear the retained flag and force sleep:
```sh
mosquitto_pub -h <broker> -t "solar-weather-station/ota_mode" -m "" -r
mosquitto_pub -h <broker> -t "solar-weather-station/sleep_mode" -m "ON"
```

## Configuration

All tunable constants are in `include/config.h`:

| Constant | Default | Description |
|----------|---------|-------------|
| `SLEEP_DURATION_US` | 1 min | Deep sleep duration |
| `WIFI_TIMEOUT_MS` | 15 000 ms | WiFi connect timeout before sleeping |
| `MQTT_TIMEOUT_MS` | 5 000 ms | MQTT connect timeout before sleeping |
| `OTA_CHECK_MS` | 500 ms | Window to drain retained MQTT messages on boot |
| `INA226_AVG` | 16 samples | INA226 hardware averaging (improves current accuracy) |
| `BATTERY_VOLTAGE_MIN/MAX` | 2.8 / 4.2 V | Li-ion cell voltage range for battery level % |
| `PIN_SENSOR_PWR` | GPIO 5 | GPIO pin supplying sensor VCC rail |
| `HELTEC_WAKE_PIN` | GPIO 6 | ESP32-S3 pin connected to Heltec V3 RST |
| `HELTEC_SERIAL_TX` | GPIO 17 | UART2 TX → Heltec GPIO 4 (Serial Module RXD) |
| `HELTEC_SERIAL_RX` | GPIO 18 | UART2 RX ← Heltec GPIO 5 (Serial Module TXD) |
| `HELTEC_BOOT_WAIT_MS` | 12 000 ms | Wait after RST pulse for Meshtastic to fully boot |
| `HELTEC_TX_WAIT_MS` | 4 000 ms | Wait after sending telemetry for Heltec LoRa TX |
| `HELTEC_SHUTDOWN_SECONDS` | 10 s | Seconds before Heltec sleeps after receiving shutdown |

## Secrets

Copy `include/secrets.h.example` to `include/secrets.h` (gitignored) and fill in:

```cpp
#define SECRET_WIFI_SSID      "your_wifi_ssid"
#define SECRET_WIFI_PASSWORD  "your_wifi_password"
#define SECRET_MQTT_HOST      "192.168.1.100"
#define SECRET_MQTT_PORT      1883
#define SECRET_OTA_PASSWORD   "your_ota_password"
```

## Project Structure

```
src/
  main.cpp                Entry point — setup() and loop()
  WeatherStation.cpp      All firmware logic
  MeshtasticSerial.cpp    Meshtastic PROTO framing and protobuf encoding
include/
  WeatherStation.h        Class declaration
  MeshtasticSerial.h      MeshtasticSerial class declaration
  config.h                Constants and tuning parameters
  SensorData.h            Sensor reading struct
  secrets.h               WiFi / MQTT / OTA credentials (gitignored)
  secrets.h.example       Credentials template (committed)
```

## Dependencies

Managed by PlatformIO (`platformio.ini`):

- `bblanchon/ArduinoJson`
- `esp32async/ESPAsyncWebServer`
- `ayushsharma82/ElegantOTA`
- `knolleary/PubSubClient`
- `adafruit/Adafruit BME280 Library`
- `sensirion/arduino-sht`
- `wollewald/BH1750_WE`
- `robtillaart/INA226`
