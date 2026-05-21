import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SensorsDataTableComponent } from '../sensors-data-table/sensors-data-table.component';
import { SensorsDataChartComponent } from '../sensors-data-chart/sensors-data-chart.component';

@Component({
  selector: 'app-main',
  imports: [SensorsDataTableComponent, SensorsDataChartComponent],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {}
