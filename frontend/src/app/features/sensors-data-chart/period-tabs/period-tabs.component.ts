import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { ZardSelectImports } from '@/shared/components/select';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';

interface PeriodOption {
  label: string;
  value: SensorDataPeriod;
}

@Component({
  selector: 'app-period-tabs',
  imports: [ZardSelectImports],
  templateUrl: './period-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodTabsComponent {
  readonly selectedChange = output<SensorDataPeriod>();

  protected readonly selectedValue = signal<SensorDataPeriod>(SensorDataPeriod.Day);

  protected readonly periodOptions: PeriodOption[] = [
    { label: 'Day', value: SensorDataPeriod.Day },
    { label: 'Week', value: SensorDataPeriod.Week },
    { label: 'Month', value: SensorDataPeriod.Month },
    { label: 'Custom Range', value: SensorDataPeriod.Custom },
  ];

  protected onSelectChange(value: string | string[]): void {
    const selected = (Array.isArray(value) ? value[0] : value) as SensorDataPeriod;
    this.selectedValue.set(selected);
    this.selectedChange.emit(selected);
  }
}
