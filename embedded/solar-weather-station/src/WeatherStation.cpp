#include "WeatherStation.h"

#include <math.h>
#include <esp_log.h>
#include <esp_sleep.h>
#include <driver/gpio.h>
#include <ArduinoJson.h>
#include <secrets.h>

static constexpr const char* TAG = "WeatherStation";

// ─── Static member definition ─────────────────────────────────────────────────

WeatherStation* WeatherStation::s_instance = nullptr;

// ─── Constructor ──────────────────────────────────────────────────────────────

WeatherStation::WeatherStation()
    : _bh1750(0x23)
    , _inaSolar(INA226_ADDR_SOLAR)
    , _inaBattery(INA226_ADDR_BATTERY)
    , _mqtt(_wifiClient)
    , _server(WEB_SERVER_PORT)
{}

// ─── Public ───────────────────────────────────────────────────────────────────

void WeatherStation::begin() {
    s_instance = this;
    _events = xEventGroupCreate();

    initHardware();
    initSensors();

    // Start WiFi (async) then immediately wake the Heltec node.
    // The 8 s Meshtastic boot wait overlaps with WiFi association time,
    // so there is virtually no extra latency added to the cycle.
    connectWifi();
    _meshtastic.begin();
    _meshtastic.wakeNode(); // pulses RST, then blocks HELTEC_BOOT_WAIT_MS

    if (!waitBits(EVT_WIFI_READY, WIFI_TIMEOUT_MS)) {
        ESP_LOGE(TAG, "WiFi timeout — entering deep sleep");
        _meshtastic.sendShutdown();
        enterDeepSleep();
    }

    if (!connectMqtt()) {
        ESP_LOGE(TAG, "MQTT connect failed — entering deep sleep");
        _meshtastic.sendShutdown();
        enterDeepSleep();
    }

    if (!waitBits(EVT_MQTT_READY, MQTT_TIMEOUT_MS)) {
        ESP_LOGE(TAG, "MQTT timeout — entering deep sleep");
        _meshtastic.sendShutdown();
        enterDeepSleep();
    }

    // Drain retained messages — OTA retained msg arrives immediately on subscribe
    drainMqtt(OTA_CHECK_MS);

    if (xEventGroupGetBits(_events) & EVT_OTA_MODE) {
        runOtaMode();
        // runOtaMode() never returns
    }

    SensorData data = readSensors();

    // Publish over WiFi/MQTT (existing path)
    publishMeasurements(data);

    // Transmit as Meshtastic environment telemetry over serial
    _meshtastic.sendEnvironmentTelemetry(data);

    // Ask Heltec to shut down after HELTEC_SHUTDOWN_SECONDS, then wait
    // HELTEC_TX_WAIT_MS for the LoRa packet to be sent before we sleep.
    _meshtastic.sendShutdown();
    delay(HELTEC_TX_WAIT_MS);

    enterDeepSleep();
}

void WeatherStation::loop() {
    // Only reached in OTA mode — loop is driven inside runOtaMode()
}

// ─── Static callbacks ─────────────────────────────────────────────────────────

void WeatherStation::onWifiEvent(void* arg, esp_event_base_t base, int32_t id, void* data) {
    if (id == WIFI_EVENT_STA_DISCONNECTED) {
        ESP_LOGW(TAG, "WiFi disconnected");
    }
}

void WeatherStation::onIpEvent(void* arg, esp_event_base_t base, int32_t id, void* data) {
    if (id == IP_EVENT_STA_GOT_IP) {
        auto* event = static_cast<ip_event_got_ip_t*>(data);
        ESP_LOGI(TAG, "WiFi connected, IP: " IPSTR, IP2STR(&event->ip_info.ip));
        auto* self = static_cast<WeatherStation*>(arg);
        xEventGroupSetBits(self->_events, EVT_WIFI_READY);
    }
}

void WeatherStation::onMqttMessage(char* topic, uint8_t* payload, unsigned int len) {
    if (!s_instance) return;
    String t(topic);
    String p(reinterpret_cast<char*>(payload), len);

    if (t == MQTT_TOPIC_OTA_MODE && p == "ON") {
        ESP_LOGI(TAG, "OTA mode requested");
        xEventGroupSetBits(s_instance->_events, EVT_OTA_MODE);
    } else if (t == MQTT_TOPIC_SLEEP_MODE && p == "ON") {
        ESP_LOGI(TAG, "Sleep mode requested");
        s_instance->enterDeepSleep();
    }
}

// ─── Private ──────────────────────────────────────────────────────────────────

void WeatherStation::initHardware() {
    // Activate N-MOSFET on sensor ground rail (HIGH = ON)
    pinMode(PIN_MOSFET, OUTPUT);
    digitalWrite(PIN_MOSFET, HIGH);

    Wire.begin(I2C_SDA, I2C_SCL);
    ESP_LOGI(TAG, "Hardware initialised (MOSFET on, I2C started)");
}

void WeatherStation::initSensors() {
    if (!_bme280.begin(0x76, &Wire)) {
        ESP_LOGE(TAG, "BME280 init failed");
    } else {
        ESP_LOGI(TAG, "BME280 ok");
    }

    if (!_sht.init(Wire)) {
        ESP_LOGE(TAG, "SHT3x init failed");
    } else {
        _sht.setAccuracy(SHTSensor::SHT_ACCURACY_HIGH);
        ESP_LOGI(TAG, "SHT3x ok");
    }

    _bh1750.init();
    _bh1750.setMode(CHM); // CHM: Continuously H-Resolution Mode (1 lux res)
    ESP_LOGI(TAG, "BH1750 ok");

    _inaSolar.begin();
    _inaSolar.setMaxCurrentShunt(10.0f, INA226_SHUNT_OHM);
    _inaSolar.setAverage(INA226_AVG);
    ESP_LOGI(TAG, "INA226 solar ok");

    _inaBattery.begin();
    _inaBattery.setMaxCurrentShunt(10.0f, INA226_SHUNT_OHM);
    _inaBattery.setAverage(INA226_AVG);
    ESP_LOGI(TAG, "INA226 battery ok");
}

void WeatherStation::connectWifi() {
    esp_netif_init();
    esp_event_loop_create_default();
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);

    esp_event_handler_register(WIFI_EVENT, ESP_EVENT_ANY_ID,    &WeatherStation::onWifiEvent, this);
    esp_event_handler_register(IP_EVENT,   IP_EVENT_STA_GOT_IP, &WeatherStation::onIpEvent,   this);

    wifi_config_t wifi_cfg = {};
    strncpy(reinterpret_cast<char*>(wifi_cfg.sta.ssid),
            SECRET_WIFI_SSID, sizeof(wifi_cfg.sta.ssid) - 1);
    strncpy(reinterpret_cast<char*>(wifi_cfg.sta.password),
            SECRET_WIFI_PASSWORD, sizeof(wifi_cfg.sta.password) - 1);
    wifi_cfg.sta.threshold.authmode = WIFI_AUTH_WPA2_PSK;

    esp_wifi_set_mode(WIFI_MODE_STA);
    esp_wifi_set_config(WIFI_IF_STA, &wifi_cfg);
    esp_wifi_start();
    esp_wifi_connect();

    ESP_LOGI(TAG, "WiFi connecting to %s", SECRET_WIFI_SSID);
}

bool WeatherStation::connectMqtt() {
    _mqtt.setServer(SECRET_MQTT_HOST, SECRET_MQTT_PORT);
    _mqtt.setCallback(&WeatherStation::onMqttMessage);

    constexpr int MAX_ATTEMPTS = 10;
    for (int i = 0; i < MAX_ATTEMPTS; ++i) {
        ESP_LOGI(TAG, "MQTT connecting (attempt %d/%d)", i + 1, MAX_ATTEMPTS);
        if (_mqtt.connect(MQTT_CLIENT_ID,
                          nullptr, nullptr,
                          MQTT_TOPIC_AVAIL, 0, true, MQTT_PAYLOAD_OFFLINE)) {
            _mqtt.subscribe(MQTT_TOPIC_OTA_MODE);
            _mqtt.subscribe(MQTT_TOPIC_SLEEP_MODE);
            _mqtt.publish(MQTT_TOPIC_AVAIL, MQTT_PAYLOAD_ONLINE, true);
            xEventGroupSetBits(_events, EVT_MQTT_READY);
            ESP_LOGI(TAG, "MQTT connected");
            return true;
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
    return false;
}

void WeatherStation::drainMqtt(uint32_t durationMs) {
    TickType_t end = xTaskGetTickCount() + pdMS_TO_TICKS(durationMs);
    while (xTaskGetTickCount() < end) {
        _mqtt.loop();
        if (xEventGroupGetBits(_events) & EVT_OTA_MODE) break;
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

SensorData WeatherStation::readSensors() {
    SensorData d;

    // BME280
    d.temperature = _bme280.readTemperature();
    d.humidity    = _bme280.readHumidity();
    d.pressure    = _bme280.readPressure() / 100.0f; // Pa → hPa
    if (isnan(d.temperature)) ESP_LOGE(TAG, "BME280 read failed");

    // SHT3x
    if (_sht.readSample()) {
        d.internalTemp     = static_cast<float>(_sht.getTemperature());
        d.internalHumidity = static_cast<float>(_sht.getHumidity());
    } else {
        ESP_LOGE(TAG, "SHT3x read failed");
    }

    // BH1750
    d.illuminance = _bh1750.getLux();
    if (d.illuminance < 0.0f) {
        ESP_LOGE(TAG, "BH1750 read failed");
        d.illuminance = NAN;
    }

    // INA226 — solar panel (getCurrent/getPower return A and W directly)
    d.solarPanelVoltage = _inaSolar.getBusVoltage();
    d.solarPanelCurrent = fmaxf(0.0f, _inaSolar.getCurrent()); // clamp negative noise to 0
    d.solarPanelPower   = _inaSolar.getPower();

    // INA226 — battery
    d.batteryVoltage = _inaBattery.getBusVoltage();
    d.batteryCurrent = _inaBattery.getCurrent();
    d.batteryPower   = _inaBattery.getPower();

    if (!isnan(d.batteryVoltage)) {
        float level = ((d.batteryVoltage - BATTERY_VOLTAGE_MIN) /
                       (BATTERY_VOLTAGE_MAX - BATTERY_VOLTAGE_MIN)) * 100.0f;
        d.batteryLevel = fmaxf(0.0f, fminf(100.0f, level));
    }

    return d;
}

void WeatherStation::publishMeasurements(const SensorData& d) {
    JsonDocument doc;
    auto set = [&](const char* key, float val) {
        if (isnan(val)) doc[key] = nullptr;
        else            doc[key] = val;
    };

    doc["mcu"]               = "ESP32-S3";
    doc["cpuFrequency"]      = 240;
    set("temperature",         d.temperature);
    set("humidity",            d.humidity);
    set("pressure",            d.pressure);
    set("internalTemperature", d.internalTemp);
    set("internalHumidity",    d.internalHumidity);
    set("illuminance",         d.illuminance);
    set("solarPanelVoltage",   d.solarPanelVoltage);
    set("solarPanelCurrent",   d.solarPanelCurrent);
    set("solarPanelPower",     d.solarPanelPower);
    set("batteryVoltage",      d.batteryVoltage);
    set("batteryCurrent",      d.batteryCurrent);
    set("batteryPower",        d.batteryPower);
    set("batteryLevel",        d.batteryLevel);

    String payload;
    serializeJson(doc, payload);

    if (_mqtt.publish(MQTT_TOPIC_MEASUREMENTS, payload.c_str())) {
        ESP_LOGI(TAG, "Published: %s", payload.c_str());
    } else {
        ESP_LOGE(TAG, "MQTT publish failed (payload %u bytes)", payload.length());
    }
}

void WeatherStation::runOtaMode() {
    // Clear the retained flag so next boot won't re-enter OTA mode
    _mqtt.publish(MQTT_TOPIC_OTA_MODE, "", true);
    ESP_LOGI(TAG, "OTA mode active — cleared retained flag, starting web server");

    ElegantOTA.begin(&_server, "admin", SECRET_OTA_PASSWORD);
    _server.begin();

    ESP_LOGI(TAG, "ElegantOTA ready at http://<ip>/update");

    while (true) {
        ElegantOTA.loop();
        _mqtt.loop();
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

void WeatherStation::enterDeepSleep() {
    _mqtt.publish(MQTT_TOPIC_AVAIL, MQTT_PAYLOAD_OFFLINE, true);
    _mqtt.disconnect();
    esp_wifi_stop();

    ESP_LOGI(TAG, "Entering deep sleep for %llu s", SLEEP_DURATION_US / 1000000ULL);
    esp_sleep_enable_timer_wakeup(SLEEP_DURATION_US);

    // Hold GPIO6 (Heltec RST) HIGH during deep sleep.
    // Without this the digital IO domain powers off and the pin floats,
    // which can hold the Heltec in reset for the entire sleep period.
    gpio_hold_en((gpio_num_t)HELTEC_WAKE_PIN);

    esp_deep_sleep_start();
}

bool WeatherStation::waitBits(EventBits_t bits, uint32_t timeoutMs) {
    EventBits_t result = xEventGroupWaitBits(
        _events, bits, pdFALSE, pdTRUE, pdMS_TO_TICKS(timeoutMs));
    return (result & bits) == bits;
}
