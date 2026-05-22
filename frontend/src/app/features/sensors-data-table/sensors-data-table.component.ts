import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { SensorsDataService } from '@/core/services/sensors-data.service';
import { SensorType } from '@/core/models/sensor-type.enum';
import {
  formatSensorValue,
  formatMeasurementDate,
  getKyivLocalTimeString,
} from '@/core/utils/formatter.util';
import {
  SensorCardComponent,
  type SensorCardConfig,
} from './sensor-card/sensor-card.component';

@Component({
  selector: 'app-sensors-data-table',
  imports: [SensorCardComponent],
  templateUrl: './sensors-data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorsDataTableComponent {
  private readonly sensorsDataService = inject(SensorsDataService);

  protected readonly data = toSignal(
    this.sensorsDataService.getLatestData().pipe(startWith(null)),
    { requireSync: true },
  );

  protected readonly isLoading = computed(() => this.data() === null);

  protected readonly currentTime = computed(() =>
    this.data() != null ? getKyivLocalTimeString() : '',
  );
  protected readonly lastUpdateTime = computed(() => {
    const date = this.data()?.date;
    return date ? formatMeasurementDate(date) : '';
  });
  protected readonly cpuFrequency = computed(() => {
    const v = this.data()?.cpuFrequency;
    return v != null ? `${v} MHz` : '—';
  });
  protected readonly ram = computed(() => {
    const kb = this.data()?.ramUsageKb;
    const pct = this.data()?.ramUsagePercent;
    if (kb != null && pct != null) return `${Math.round(pct)}% (${Math.round(kb)} KB)`;
    if (pct != null) return `${Math.round(pct)}%`;
    if (kb != null) return `${Math.round(kb)} KB`;
    return '—';
  });

  protected readonly temperature = computed(() =>
    formatSensorValue(this.data()?.temperature, SensorType.Temperature),
  );
  protected readonly humidity = computed(() =>
    formatSensorValue(this.data()?.humidity, SensorType.Humidity),
  );
  protected readonly pressure = computed(() =>
    formatSensorValue(this.data()?.pressure, SensorType.Pressure),
  );
  protected readonly illuminance = computed(() =>
    formatSensorValue(this.data()?.illuminance, SensorType.Illuminance),
  );
  protected readonly internalTemperature = computed(() =>
    formatSensorValue(this.data()?.internalTemperature, SensorType.InternalTemperature),
  );
  protected readonly internalHumidity = computed(() =>
    formatSensorValue(this.data()?.internalHumidity, SensorType.InternalHumidity),
  );
  protected readonly batteryLevel = computed(() =>
    formatSensorValue(this.data()?.batteryLevel, SensorType.BatteryLevel),
  );
  protected readonly batteryVoltage = computed(() =>
    formatSensorValue(this.data()?.batteryVoltage, SensorType.BatteryVoltage),
  );
  protected readonly batteryCurrent = computed(() =>
    formatSensorValue(this.data()?.batteryCurrent, SensorType.BatteryCurrent),
  );
  protected readonly batteryPower = computed(() =>
    formatSensorValue(this.data()?.batteryPower, SensorType.BatteryPower),
  );
  protected readonly solarVoltage = computed(() =>
    formatSensorValue(this.data()?.solarPanelVoltage, SensorType.SolarPanelVoltage),
  );
  protected readonly solarCurrent = computed(() =>
    formatSensorValue(this.data()?.solarPanelCurrent, SensorType.SolarPanelCurrent),
  );
  protected readonly solarPower = computed(() =>
    formatSensorValue(this.data()?.solarPanelPower, SensorType.SolarPanelPower),
  );

  protected readonly cards = computed<SensorCardConfig[]>(() => [
    {
      title: 'System Status',
      titleIcon: 'lucideCpu',
      rows: [
        { icon: 'lucideClock', label: 'Local time', value: this.currentTime() },
        { icon: 'lucideClockArrowUp', label: 'Last updated', value: this.lastUpdateTime() },
        { icon: 'lucideCpu', label: 'MCU', value: this.data()?.mcu ?? '—' },
        { icon: 'lucideActivity', label: 'CPU frequency', value: this.cpuFrequency() },
        { icon: 'lucideMemoryStick', label: 'RAM usage', value: this.ram() },
      ],
    },
    {
      title: 'Environment',
      titleIcon: 'lucideThermometer',
      rows: [
        { icon: 'lucideThermometer', label: 'Temperature', value: this.temperature() },
        { icon: 'lucideDroplet', label: 'Humidity', value: this.humidity() },
        { icon: 'lucideGauge', label: 'Pressure', value: this.pressure() },
        { icon: 'lucideSun', label: 'Illuminance', value: this.illuminance() },
      ],
    },
    {
      title: 'Internal',
      titleIcon: 'lucideThermometer',
      rows: [
        { icon: 'lucideThermometer', label: 'Temperature', value: this.internalTemperature() },
        { icon: 'lucideDroplet', label: 'Humidity', value: this.internalHumidity() },
      ],
    },
    {
      title: 'Battery',
      titleIcon: 'lucideBattery',
      rows: [
        { icon: 'lucideBattery', label: 'Level', value: this.batteryLevel() },
        { icon: 'lucideZap', label: 'Voltage', value: this.batteryVoltage() },
        { icon: 'lucideZap', label: 'Current', value: this.batteryCurrent() },
        { icon: 'lucideZap', label: 'Power', value: this.batteryPower() },
      ],
    },
    {
      title: 'Solar Panel',
      titleIcon: 'lucideSun',
      rows: [
        { icon: 'lucideSun', label: 'Voltage', value: this.solarVoltage() },
        { icon: 'lucideSun', label: 'Current', value: this.solarCurrent() },
        { icon: 'lucideSun', label: 'Power', value: this.solarPower() },
      ],
    },
  ]);
}
