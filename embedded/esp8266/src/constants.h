#define SERIAL_BAUD 115200
#define SLEEP_DURATION 6e8
#define BMP_SENSOR_I2C_ADDRESS 0x76
#define SHT_SENSOR_I2C_ADDRESS 0x44
#define RELAY_PIN 12
#define MUX_PIN_S0 D3
#define MUX_PIN_S1 D4
#define MUX_PIN_S2 D7
#define MUX_PIN_S3 D8
#define MQTT_HOST "192.168.1.8"
#define MQTT_PORT 1883
#define MQTT_CLIENT_ID "ESP8266_Solar_Weather_Station"
#define MQTT_TOPIC "esp8266-solar-weather-station/sensors"
#define MQTT_KEEP_ALIVE_TOPIC "esp8266-solar-weather-station/keep-alive"