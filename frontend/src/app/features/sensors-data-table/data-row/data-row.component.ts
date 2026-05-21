import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideBattery,
  lucideClock,
  lucideClockArrowUp,
  lucideCpu,
  lucideDroplet,
  lucideGauge,
  lucideMemoryStick,
  lucideSun,
  lucideThermometer,
  lucideZap,
} from '@ng-icons/lucide';
import { ZardTableCellComponent } from '@/shared/components/table';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';

@Component({
  selector: 'tr[app-data-row]',
  imports: [NgIcon, ZardTableCellComponent, ZardSkeletonComponent],
  viewProviders: [
    provideIcons({
      lucideActivity,
      lucideBattery,
      lucideClock,
      lucideClockArrowUp,
      lucideCpu,
      lucideDroplet,
      lucideGauge,
      lucideMemoryStick,
      lucideSun,
      lucideThermometer,
      lucideZap,
    }),
  ],
  templateUrl: './data-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataRowComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input<string>('');
  readonly isLoading = input<boolean>(false);
}
