import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ThemeService } from '@/core/services/theme.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, startWith } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Plugin } from 'chart.js';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { SensorsDataService } from '@/core/services/sensors-data.service';
import { SensorType } from '@/core/models/sensor-type.enum';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { ChartPoint } from '@/core/models/chart-point.model';
import { toChartPoints } from '@/core/utils/sensors-data.util';
import { formatTooltipDate } from '@/core/utils/formatter.util';
import { SensorTypeTabsComponent } from './sensor-type-tabs/sensor-type-tabs.component';
import { PeriodTabsComponent } from './period-tabs/period-tabs.component';

@Component({
  selector: 'app-sensors-data-chart',
  imports: [
    ZardCardComponent,
    ZardSkeletonComponent,
    BaseChartDirective,
    SensorTypeTabsComponent,
    PeriodTabsComponent,
  ],
  templateUrl: './sensors-data-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorsDataChartComponent {
  private readonly sensorsDataService = inject(SensorsDataService);
  private readonly theme = inject(ThemeService);

  protected readonly sensorType = signal<SensorType>(SensorType.Temperature);
  protected readonly period = signal<SensorDataPeriod>(SensorDataPeriod.Day);

  private readonly params = computed(() => ({ type: this.sensorType(), period: this.period() }));

  protected readonly rawData = toSignal(
    toObservable(this.params).pipe(
      switchMap(({ type, period }) =>
        this.sensorsDataService.getAggregatedData(period, type).pipe(startWith(null)),
      ),
    ),
    { initialValue: null },
  );

  protected readonly isLoading = computed(() => this.rawData() === null);

  protected readonly chartData = computed((): ChartPoint[] => {
    const raw = this.rawData();
    if (!raw) return [];
    return toChartPoints(raw, this.period());
  });

  protected readonly chartJsData = computed((): ChartData<'line'> => {
    const points = this.chartData();
    return {
      labels: points.map((p) => p.date),
      datasets: [
        {
          label: 'Min',
          data: points.map((p) => p.min),
          borderWidth: 1,
          borderDash: [3, 3],
          borderColor: 'rgba(96, 165, 250, 0.3)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Max',
          data: points.map((p) => p.max),
          borderWidth: 0,
          borderColor: 'transparent',
          backgroundColor: 'rgba(96, 165, 250, 0.06)',
          pointRadius: 0,
          tension: 0.4,
          fill: '-1',
        },
        {
          label: 'Avg',
          data: points.map((p) => p.avg),
          borderWidth: 1.5,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 2,
          tension: 0.4,
          fill: 'start',
        },
      ],
    };
  });

  protected readonly chartOptions = computed((): ChartOptions<'line'> => {
    const dark = this.theme.isDark();
    const tickColor = dark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
    const gridColor = dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 8,
            maxRotation: 0,
            color: tickColor,
            font: { size: 12 },
          },
          border: { display: false },
        },
        y: {
          border: { display: false },
          grid: { color: gridColor },
          ticks: { maxTicksLimit: 6, color: tickColor, font: { size: 12 } },
          grace: '10%',
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              if (!items.length) return '';
              const dataIndex = items[0].dataIndex;
              const points = this.chartData();
              if (dataIndex >= points.length) return '';
              return formatTooltipDate(points[dataIndex].bucket);
            },
            label: () => '',
            afterBody: (items) => {
              if (!items.length) return [];
              const dataIndex = items[0].dataIndex;
              const points = this.chartData();
              if (dataIndex >= points.length) return [];
              const point = points[dataIndex];
              return [`Avg: ${point.avg}`, `Min: ${point.min}`, `Max: ${point.max}`];
            },
          },
        },
      },
    };
  });

  protected readonly gradientPlugin: Plugin<'line'> = {
    id: 'chartGradient',
    afterUpdate: (chart) => {
      if (!chart.chartArea || chart.data.datasets.length < 3) return;
      const { ctx, chartArea } = chart;

      const avgMeta = chart.getDatasetMeta(2);
      if (!avgMeta.dataset) return;

      // Start gradient from the highest data point pixel so it fades from the line downward
      const points = avgMeta.data as { y: number }[];
      const topY = points.reduce(
        (min, p) => Math.min(min, isFinite(p.y) ? p.y : Infinity),
        Infinity,
      );
      const gradientTop = isFinite(topY) ? topY : chartArea.top;

      const gradient = ctx.createLinearGradient(0, gradientTop, 0, chartArea.bottom);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

      // The fill plugin reads from meta.dataset.options (resolved options), not chart.data.datasets.
      // We must patch the resolved options here, after Chart.js has finished resolving them,
      // so the gradient is used immediately on the first render.
      (
        avgMeta.dataset as unknown as { options: { backgroundColor: unknown } }
      ).options.backgroundColor = gradient;
    },
  };

  protected readonly chartPlugins = [this.gradientPlugin];

  protected onSensorTypeChange(type: SensorType): void {
    this.sensorType.set(type);
  }

  protected onPeriodChange(period: SensorDataPeriod): void {
    this.period.set(period);
  }
}
