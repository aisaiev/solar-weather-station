#include "MeshtasticSerial.h"

#include <driver/gpio.h>
#include <esp_log.h>
#include <math.h>
#include <string.h>

static constexpr const char *TAG = "Meshtastic";

// ─── Public
// ───────────────────────────────────────────────────────────────────

void MeshtasticSerial::begin() {
  // Release the GPIO hold that was applied before deep sleep.
  // This must be done before calling pinMode/digitalWrite.
  gpio_hold_dis((gpio_num_t)HELTEC_WAKE_PIN);

  pinMode(HELTEC_WAKE_PIN, OUTPUT);
  digitalWrite(HELTEC_WAKE_PIN, HIGH); // idle HIGH — Heltec RST is active-low

  // Assign UART2 to our chosen GPIO pins.
  // Arduino ESP32 Serial2.begin(baud, config, rxPin, txPin)
  Serial2.begin(115200, SERIAL_8N1, HELTEC_SERIAL_RX, HELTEC_SERIAL_TX);

  ESP_LOGI(TAG, "UART2 ready (TX=GPIO%d → Heltec RXD, RX=GPIO%d ← Heltec TXD)",
           HELTEC_SERIAL_TX, HELTEC_SERIAL_RX);
}

void MeshtasticSerial::wakeNode() {
  resetNode();

  ESP_LOGI(TAG, "Waiting %u ms for Meshtastic to boot...", HELTEC_BOOT_WAIT_MS);
  delay(HELTEC_BOOT_WAIT_MS);
  ESP_LOGI(TAG, "Heltec node should be ready");
}

void MeshtasticSerial::resetNode() {
  ESP_LOGI(TAG, "Pulsing RST pin LOW for 500 ms to reset Heltec V3");
  digitalWrite(HELTEC_WAKE_PIN, LOW);
  delay(500);
  digitalWrite(HELTEC_WAKE_PIN, HIGH);
  ESP_LOGI(TAG, "Heltec RST pulse complete");
}

void MeshtasticSerial::sendEnvironmentTelemetry(const SensorData &d) {
  // Build protobuf from innermost message outward.
  // Buffer sizes are generous — actual payloads are small.
  uint8_t env[32], tel[48], dat[64], pkt[80], tor[96];
  size_t n;

  // ── 1. EnvironmentMetrics ──────────────────────────────────────────────
  // Omit NaN fields entirely (optional fields absent = NaN semantics in
  // Meshtastic clients).
  n = 0;
  if (!isnan(d.temperature))
    n += writeFloat(env + n, 1, d.temperature);
  if (!isnan(d.humidity))
    n += writeFloat(env + n, 2, d.humidity);
  if (!isnan(d.pressure))
    n += writeFloat(env + n, 3, d.pressure);
  if (!isnan(d.illuminance))
    n += writeFloat(env + n, 9, d.illuminance);
  const size_t envLen = n;

  // ── 2. Telemetry { time=0, environment_metrics=<env> } ────────────────
  // time=0: no RTC available; Meshtastic will use mesh receive timestamp.
  n = 0;
  n += writeFixed32(tel + n, 1, 0);            // time (fixed32, field 1)
  n += writeLenDelim(tel + n, 3, env, envLen); // environment_metrics (field 3)
  const size_t telLen = n;

  // ── 3. Data { portnum=67 (TELEMETRY_APP), payload=<telemetry bytes> } ─
  n = 0;
  n += writeVarintField(dat + n, 1, 67);       // portnum = TELEMETRY_APP
  n += writeLenDelim(dat + n, 2, tel, telLen); // payload
  const size_t datLen = n;

  // ── 4. MeshPacket { to=broadcast, decoded=<data>, hop_limit=3 } ───────
  n = 0;
  n += writeFixed32(pkt + n, 2,
                    0xFFFFFFFFu); // to = BROADCAST_ADDR (fixed32, field 2)
  n += writeLenDelim(pkt + n, 4, dat, datLen); // decoded (field 4)
  n += writeVarintField(pkt + n, 9, 3);        // hop_limit (field 9)
  const size_t pktLen = n;

  // ── 5. ToRadio { packet=<mesh_packet> } ───────────────────────────────
  n = 0;
  n += writeLenDelim(tor + n, 1, pkt, pktLen); // packet (field 1)
  const size_t torLen = n;

  writeFramed(tor, torLen);

  ESP_LOGI(TAG,
           "Sent environment telemetry: temp=%.1f°C hum=%.1f%% pres=%.1fhPa "
           "lux=%.0f (%u payload bytes)",
           d.temperature, d.humidity, d.pressure, d.illuminance,
           static_cast<unsigned>(torLen));
}

void MeshtasticSerial::sendShutdown() {
  uint8_t adm[8], dat[20], pkt[40], tor[48];
  size_t n;

  // ── 1. AdminMessage { shutdown_seconds = HELTEC_SHUTDOWN_SECONDS } ────
  // Field 98, wire type 0 (varint).
  // Tag varint = (98 << 3) | 0 = 784 → two varint bytes: [0x90, 0x06]
  n = 0;
  adm[n++] = 0x90; // low 7 bits of 784 (= 0x10) with continuation bit set
  adm[n++] = 0x06; // high bits of 784 (= 6)
  n += writeVarint(adm + n, HELTEC_SHUTDOWN_SECONDS);
  const size_t admLen = n;

  // ── 2. Data { portnum=6 (ADMIN_APP), payload=<admin_message bytes> } ──
  n = 0;
  n += writeVarintField(dat + n, 1, 6);        // portnum = ADMIN_APP
  n += writeLenDelim(dat + n, 2, adm, admLen); // payload
  const size_t datLen = n;

  // ── 3. MeshPacket { to=broadcast, decoded=<data>, hop_limit=0 } ───────
  // hop_limit=0 prevents the packet from being re-broadcast on the mesh;
  // the Heltec processes it locally as an admin command.
  n = 0;
  n += writeFixed32(pkt + n, 2, 0xFFFFFFFFu);  // to = BROADCAST_ADDR
  n += writeLenDelim(pkt + n, 4, dat, datLen); // decoded
  n += writeVarintField(pkt + n, 9, 0);        // hop_limit = 0 (local only)
  const size_t pktLen = n;

  // ── 4. ToRadio { packet=<mesh_packet> } ───────────────────────────────
  n = 0;
  n += writeLenDelim(tor + n, 1, pkt, pktLen);
  const size_t torLen = n;

  writeFramed(tor, torLen);

  ESP_LOGI(TAG, "Sent shutdown command (Heltec will sleep in %u s)",
           static_cast<unsigned>(HELTEC_SHUTDOWN_SECONDS));
}

// ─── Private — protobuf helpers
// ───────────────────────────────────────────────

size_t MeshtasticSerial::writeVarint(uint8_t *buf, uint64_t v) {
  size_t n = 0;
  do {
    // Write 7 bits; set the continuation bit if more bytes follow.
    buf[n++] = static_cast<uint8_t>((v & 0x7Fu) | (v > 0x7Fu ? 0x80u : 0u));
    v >>= 7;
  } while (v);
  return n;
}

size_t MeshtasticSerial::writeFloat(uint8_t *buf, uint8_t field, float v) {
  buf[0] = static_cast<uint8_t>((field << 3u) | 5u); // wire type 5 = 32-bit
  uint32_t bits = 0;
  memcpy(&bits, &v, sizeof(bits));
  buf[1] = static_cast<uint8_t>(bits & 0xFFu);
  buf[2] = static_cast<uint8_t>((bits >> 8u) & 0xFFu);
  buf[3] = static_cast<uint8_t>((bits >> 16u) & 0xFFu);
  buf[4] = static_cast<uint8_t>((bits >> 24u) & 0xFFu);
  return 5;
}

size_t MeshtasticSerial::writeFixed32(uint8_t *buf, uint8_t field, uint32_t v) {
  buf[0] = static_cast<uint8_t>((field << 3u) | 5u); // wire type 5 = 32-bit
  buf[1] = static_cast<uint8_t>(v & 0xFFu);
  buf[2] = static_cast<uint8_t>((v >> 8u) & 0xFFu);
  buf[3] = static_cast<uint8_t>((v >> 16u) & 0xFFu);
  buf[4] = static_cast<uint8_t>((v >> 24u) & 0xFFu);
  return 5;
}

size_t MeshtasticSerial::writeVarintField(uint8_t *buf, uint8_t field,
                                          uint64_t v) {
  buf[0] = static_cast<uint8_t>((field << 3u) | 0u); // wire type 0 = varint
  return 1u + writeVarint(buf + 1, v);
}

size_t MeshtasticSerial::writeLenDelim(uint8_t *buf, uint8_t field,
                                       const uint8_t *data, size_t len) {
  buf[0] = static_cast<uint8_t>((field << 3u) |
                                2u); // wire type 2 = length-delimited
  const size_t varintBytes = writeVarint(buf + 1, static_cast<uint64_t>(len));
  memcpy(buf + 1 + varintBytes, data, len);
  return 1u + varintBytes + len;
}

// ─── Private — framing
// ────────────────────────────────────────────────────────

void MeshtasticSerial::writeFramed(const uint8_t *data, size_t len) {
  // Meshtastic serial PROTO mode framing:
  //   [0x94][0xC3][len_hi][len_lo][...protobuf bytes...]
  const uint8_t header[4] = {0x94, 0xC3,
                             static_cast<uint8_t>((len >> 8u) & 0xFFu),
                             static_cast<uint8_t>(len & 0xFFu)};
  Serial2.write(header, sizeof(header));
  Serial2.write(data, len);
  Serial2.flush();
}
