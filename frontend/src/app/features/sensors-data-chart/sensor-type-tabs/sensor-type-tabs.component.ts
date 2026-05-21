import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBattery,
  lucideDroplet,
  lucideGauge,
  lucideSun,
  lucideThermometer,
  lucideZap,
} from '@ng-icons/lucide';
import { ZardTabComponent, ZardTabGroupComponent } from '@/shared/components/tabs';
import { SensorType } from '@/core/models/sensor-type.enum';

interface SensorTypeTab {
  label: string;
  value: SensorType;
  icon: string;
}

@Component({
  selector: 'app-sensor-type-tabs',
  imports: [ZardTabGroupComponent, ZardTabComponent],
  viewProviders: [
    provideIcons({
      lucideBattery,
      lucideDroplet,
      lucideGauge,
      lucideSun,
      lucideThermometer,
      lucideZap,
    }),
  ],
  templateUrl: './sensor-type-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorTypeTabsComponent {
  readonly selectedChange = output<SensorType>();

  protected readonly sensorTypeTabs: SensorTypeTab[] = [
    { label: 'Temperature', value: SensorType.Temperature, icon: 'lucideThermometer' },
    { label: 'Humidity', value: SensorType.Humidity, icon: 'lucideDroplet' },
    { label: 'Pressure', value: SensorType.Pressure, icon: 'lucideGauge' },
    {
      label: 'Internal Temperature',
      value: SensorType.InternalTemperature,
      icon: 'lucideThermometer',
    },
    { label: 'Internal Humidity', value: SensorType.InternalHumidity, icon: 'lucideDroplet' },
    { label: 'Illuminance', value: SensorType.Illuminance, icon: 'lucideSun' },
    { label: 'Battery Voltage', value: SensorType.BatteryVoltage, icon: 'lucideZap' },
    { label: 'Battery Current', value: SensorType.BatteryCurrent, icon: 'lucideZap' },
    { label: 'Battery Power', value: SensorType.BatteryPower, icon: 'lucideZap' },
    { label: 'Battery Level', value: SensorType.BatteryLevel, icon: 'lucideBattery' },
    { label: 'Solar Panel Voltage', value: SensorType.SolarPanelVoltage, icon: 'lucideSun' },
    { label: 'Solar Panel Current', value: SensorType.SolarPanelCurrent, icon: 'lucideSun' },
    { label: 'Solar Panel Power', value: SensorType.SolarPanelPower, icon: 'lucideSun' },
  ];

  protected onTabChange(event: { index: number; label: string; tab: ZardTabComponent }): void {
    const tab = this.sensorTypeTabs[event.index];
    if (tab) this.selectedChange.emit(tab.value);
  }
}
