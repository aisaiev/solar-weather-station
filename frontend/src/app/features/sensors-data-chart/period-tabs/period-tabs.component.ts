import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ZardTabComponent, ZardTabGroupComponent } from '@/shared/components/tabs';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';

interface PeriodTab {
  label: string;
  value: SensorDataPeriod;
}

@Component({
  selector: 'app-period-tabs',
  imports: [ZardTabGroupComponent, ZardTabComponent],
  templateUrl: './period-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodTabsComponent {
  readonly selectedChange = output<SensorDataPeriod>();

  protected readonly periodTabs: PeriodTab[] = [
    { label: 'Day', value: SensorDataPeriod.Day },
    { label: 'Week', value: SensorDataPeriod.Week },
    { label: 'Month', value: SensorDataPeriod.Month },
  ];

  protected onTabChange(event: { index: number; label: string; tab: ZardTabComponent }): void {
    const tab = this.periodTabs[event.index];
    if (tab) {
      this.selectedChange.emit(tab.value);
    }
  }
}
