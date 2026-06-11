#include "WeatherStation.h"
#include <Arduino.h>

void setup() {
  static WeatherStation station;
  station.begin();
}

void loop() {
  // Execution stays inside WeatherStation::runOtaMode() during OTA,
  // or never reaches here (device enters deep sleep after begin()).
}
