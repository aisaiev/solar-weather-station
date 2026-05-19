# Solar Weather Station — Firmware

ESP32-S3 firmware for a solar-powered weather station. Reads environmental and power sensors over I2C, publishes a JSON payload to MQTT, then enters deep sleep. OTA updates are supported via a retained MQTT trigger.

## Hardware

| Component | Interface | Address |
|-----------|-----------|---------|
| BME280 (temperature, humidity, pressure) | I2C | 0x76 |
| SHT3x (internal temperature, humidity) | I2C | default |
| BH1750 (illuminance) | I2C | 0x23 |
| INA226 — solar panel (voltage, current, power) | I2C | 0x40 |
| INA226 — battery (voltage, current, power, level) | I2C | 0x41 |
| IRLB8748PBF N-MOSFET (sensor ground rail) | GPIO 5 | — |

**I2C pins:** SDA = GPIO 1, SCL = GPIO 2  
**MOSFET pin:** GPIO 5 (IRLB8748PBF N-MOSFET) — gate driven HIGH to connect sensor ground rail and switch sensors ON.

## Wake Cycle

```
Boot
 ├─ MOSFET ON → I2C init → sensor init
 ├─ WiFi connect (esp_wifi_*)
 ├─ MQTT connect → subscribe to ota_mode + sleep_mode
 ├─ Drain retained messages (500 ms)
 │   ├─ [ota_mode = ON] → clear retained flag → start OTA web server → loop forever
 │   └─ [no OTA] → read sensors → publish JSON → deep sleep (5 min)
```

Active time is typically 5–7 seconds per cycle.

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
  "solarVoltage": 18.2,
  "solarCurrent": 0.34,
  "solarPower": 6.18,
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
| `SLEEP_DURATION_US` | 5 min | Deep sleep duration |
| `WIFI_TIMEOUT_MS` | 15 000 ms | WiFi connect timeout before sleeping |
| `MQTT_TIMEOUT_MS` | 5 000 ms | MQTT connect timeout before sleeping |
| `OTA_CHECK_MS` | 500 ms | Window to drain retained MQTT messages on boot |
| `INA226_AVG` | 16 samples | INA226 hardware averaging (improves current accuracy) |
| `BATTERY_VOLTAGE_MIN/MAX` | 2.8 / 4.2 V | Li-ion cell voltage range for battery level % |

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
  main.cpp              Entry point — setup() and loop()
  WeatherStation.cpp    All firmware logic
include/
  WeatherStation.h      Class declaration
  config.h              Constants and tuning parameters
  SensorData.h          Sensor reading struct
  secrets.h             WiFi / MQTT / OTA credentials (gitignored)
  secrets.h.example     Credentials template (committed)
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
