import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ThemeService } from '@/core/services/theme.service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, startWith, filter, merge, map } from 'rxjs';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import {
  CategoryScale,
  ChartData,
  ChartOptions,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  Plugin,
  PointElement,
  Tooltip,
} from 'chart.js';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { ZardDatePickerComponent } from '@/shared/components/date-picker';
import { SensorsDataService } from '@/core/services/sensors-data.service';
import { SensorType } from '@/core/models/sensor-type.enum';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { ChartPoint } from '@/core/models/chart-point.model';
import { toChartPoints } from '@/core/utils/sensors-data.util';
import { formatTooltipDate } from '@/core/utils/formatter.util';
import { SensorTypeTabsComponent } from './sensor-type-tabs/sensor-type-tabs.component';
import { PeriodSelectComponent } from './period-select/period-select.component';
import { AggregatedDataParams } from '@/core/models/aggregated-data-params.model';
import { ZardButtonComponent } from '@/shared/components/button';
import { ExportScope } from '@/core/models/export-scope.enum';
import { ExportCsvParams } from '@/core/models/export-csv-params.model';
import { ZardDropdownImports } from '@/shared/components/dropdown';

@Component({
  selector: 'app-sensors-data-chart',
  imports: [
    ZardCardComponent,
    ZardSkeletonComponent,
    ZardDatePickerComponent,
    BaseChartDirective,
    SensorTypeTabsComponent,
    PeriodSelectComponent,
    ZardButtonComponent,
    ZardDropdownImports,
  ],
  providers: [
    provideCharts({
      registerables: [
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Tooltip,
        Filler,
      ],
    }),
  ],
  templateUrl: './sensors-data-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorsDataChartComponent {
  private readonly sensorsDataService = inject(SensorsDataService);
  private readonly theme = inject(ThemeService);

  protected readonly sensorType = signal<SensorType>(SensorType.Temperature);
  protected readonly period = signal<SensorDataPeriod>(SensorDataPeriod.Day);
  protected readonly dateFrom = signal<Date | null>(null);
  protected readonly dateTo = signal<Date | null>(null);

  protected readonly isCustomMode = computed(() => this.period() === SensorDataPeriod.Custom);
  protected readonly exportScopeEnum = ExportScope;
  protected readonly isExporting = signal(false);

  private readonly params = computed((): AggregatedDataParams | null => {
    const period = this.period();
    const type = this.sensorType();
    if (period === SensorDataPeriod.Custom) {
      const from = this.dateFrom();
      const to = this.dateTo();
      if (!from || !to) return null;
      return { type, from, to };
    }
    return { type, period };
  });

  private readonly params$ = toObservable(this.params);
  private readonly liveRefreshParams$ = this.sensorsDataService
    .streamLatestData()
    .pipe(map(() => this.params()));

  protected readonly rawData = toSignal(
    merge(this.params$, this.liveRefreshParams$).pipe(
      filter((p) => p !== null),
      switchMap((p) => this.sensorsDataService.getAggregatedData(p).pipe(startWith(null))),
    ),
    { initialValue: null },
  );

  private readonly showYear = computed(() => {
    const raw = this.rawData();
    if (!raw || raw.length < 2) return false;
    const firstYear = new Date(raw[0].bucket).getFullYear();
    return raw.some((p) => new Date(p.bucket).getFullYear() !== firstYear);
  });

  protected readonly isLoading = computed(() => this.rawData() === null);
  protected readonly canExport = computed(() => {
    if (this.isExporting()) return false;
    if (!this.isCustomMode()) return true;
    return this.dateFrom() !== null && this.dateTo() !== null;
  });

  protected readonly chartData = computed((): ChartPoint[] => {
    const raw = this.rawData();
    if (!raw) return [];
    const period = this.period();
    return toChartPoints(raw, period);
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
    const points = this.chartData();
    let yMin: number | undefined;
    let yMax: number | undefined;
    if (points.length) {
      const dataMin = Math.min(...points.map((p) => p.min));
      const dataMax = Math.max(...points.map((p) => p.max));
      const margin = (dataMax - dataMin) * 0.05 || 1;
      yMin = dataMin - margin;
      yMax = dataMax + margin;
    }
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
          min: yMin,
          max: yMax,
          border: { display: false },
          grid: { color: gridColor },
          ticks: { maxTicksLimit: 6, color: tickColor, font: { size: 12 } },
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
              return formatTooltipDate(points[dataIndex].bucket, this.period(), this.showYear());
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
    if (period !== SensorDataPeriod.Custom) {
      this.dateFrom.set(null);
      this.dateTo.set(null);
    }
  }

  protected onDateFromChange(date: Date | null): void {
    this.dateFrom.set(date);
  }

  protected onDateToChange(date: Date | null): void {
    this.dateTo.set(date);
  }

  protected onExportCsv(scope: ExportScope): void {
    const params = this.buildExportParams(scope);
    if (!params) return;

    this.isExporting.set(true);
    this.sensorsDataService.exportCsv(params).subscribe({
      next: (blob) => {
        const timestamp = this.formatFileTimestamp(new Date());
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-export-${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
      complete: () => this.isExporting.set(false),
      error: () => this.isExporting.set(false),
    });
  }

  private buildExportParams(scope: ExportScope): ExportCsvParams | null {
    const common = {
      scope,
      ...(scope === ExportScope.Selected ? { type: this.sensorType() } : {}),
    };
    const period = this.period();

    if (period === SensorDataPeriod.Custom) {
      const from = this.dateFrom();
      const to = this.dateTo();
      if (!from || !to) return null;
      return { ...common, from, to };
    }

    return { ...common, period };
  }

  private formatFileTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}`;
  }
}
