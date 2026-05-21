import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBattery, lucideCpu, lucideSun, lucideThermometer } from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardTableImports } from '@/shared/components/table';
import { DataRowComponent } from '../data-row/data-row.component';

export interface SensorCardRow {
  icon: string;
  label: string;
  value: string;
}

export interface SensorCardConfig {
  title: string;
  titleIcon: string;
  rows: SensorCardRow[];
}

@Component({
  selector: 'app-sensor-card',
  imports: [NgIcon, ZardCardComponent, ...ZardTableImports, DataRowComponent],
  viewProviders: [provideIcons({ lucideBattery, lucideCpu, lucideSun, lucideThermometer })],
  templateUrl: './sensor-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class SensorCardComponent {
  readonly title = input.required<string>();
  readonly titleIcon = input.required<string>();
  readonly rows = input.required<SensorCardRow[]>();
  readonly isLoading = input<boolean>(false);
}
