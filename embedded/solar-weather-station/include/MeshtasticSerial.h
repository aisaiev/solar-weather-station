#pragma once

#include "SensorData.h"
#include "config.h"
#include <Arduino.h>

// Sends environment telemetry and admin commands to a Heltec V3 running
// Meshtastic with the Serial Module configured in PROTO mode (115200 baud).
//
// Wiring (ESP32-S3 side → Heltec V3 side):
//   HELTEC_WAKE_PIN  (GPIO6)  → Heltec RST  (500ms LOW pulse reboots Heltec)
//   HELTEC_SERIAL_TX (GPIO17) → Heltec GPIO4 (Serial Module RXD in Meshtastic
//   config) HELTEC_SERIAL_RX (GPIO18) ← Heltec GPIO5 (Serial Module TXD in
//   Meshtastic config) GND ──────────────────── GND
//
// Meshtastic config on Heltec V3:
//   Modules → Serial: enabled=true, mode=PROTO, baud=115200, rxd=4, txd=5
//   Telemetry: environment sensor disabled (we inject data from here)

class MeshtasticSerial {
public:
  // Initialise UART2 and set the wake pin idle-high. Call once in setup.
  void begin();

  // Pulse HELTEC_WAKE_PIN LOW for 500 ms to reset the Heltec node.
  void resetNode();

  // Reset/wake the Heltec node, then block for HELTEC_BOOT_WAIT_MS while
  // Meshtastic boots.
  void wakeNode();

  // Encode sensor readings as a Meshtastic environment telemetry packet
  // (portnum=TELEMETRY_APP, to=broadcast) and write it over Serial2.
  // NaN fields are omitted from the protobuf.
  void sendEnvironmentTelemetry(const SensorData &d);

  // Send an AdminMessage asking Heltec to shut down after
  // HELTEC_SHUTDOWN_SECONDS seconds (hop_limit=0, local only).
  void sendShutdown();

private:
  // ── Minimal hand-encoded protobuf helpers ────────────────────────────────
  // All functions write to buf and return the number of bytes written.

  // Encode a raw varint value (no field tag).
  static size_t writeVarint(uint8_t *buf, uint64_t v);

  // Wire-type 5 (32-bit) float field.
  static size_t writeFloat(uint8_t *buf, uint8_t field, float v);

  // Wire-type 5 (32-bit) fixed32 field.
  static size_t writeFixed32(uint8_t *buf, uint8_t field, uint32_t v);

  // Wire-type 0 (varint) field (field number 1-15 only).
  static size_t writeVarintField(uint8_t *buf, uint8_t field, uint64_t v);

  // Wire-type 2 (length-delimited) field (field number 1-15 only).
  static size_t writeLenDelim(uint8_t *buf, uint8_t field, const uint8_t *data,
                              size_t len);

  // Prepend the 4-byte Meshtastic serial framing header and write to Serial2.
  // Frame: [0x94][0xC3][len_hi][len_lo][protobuf bytes...]
  void writeFramed(const uint8_t *data, size_t len);
};
