import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SensorsDataChartComponent } from './sensors-data-chart.component';
import { SensorsDataService } from '@/core/services/sensors-data.service';
import { ThemeService } from '@/core/services/theme.service';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { SensorType } from '@/core/models/sensor-type.enum';
import type { ChartData, ChartOptions, TooltipItem, TooltipModel } from 'chart.js';

const mockSensorsDataService = {
  getAggregatedData: vi.fn(() =>
    of([
      {
        bucket: '2026-01-01T00:00:00.000Z',
        avg: 10,
        min: 8,
        max: 12,
      },
    ]),
  ),
  exportCsv: vi.fn(() => of(new Blob(['csv']))),
};

class MockThemeService {
  isDark = vi.fn(() => false);
}

type ChartComponentTestApi = {
  canExport: () => boolean;
  isExporting: { set: (value: boolean) => void };
  onPeriodChange: (period: SensorDataPeriod) => void;
  onDateFromChange: (date: Date | null) => void;
  onDateToChange: (date: Date | null) => void;
  onSensorTypeChange: (type: SensorType) => void;
  chartJsData: () => ChartData<'line'>;
  chartOptions: () => ChartOptions<'line'>;
};

describe('SensorsDataChartComponent', () => {
  let fixture: ComponentFixture<SensorsDataChartComponent>;
  let component: SensorsDataChartComponent;
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(function (this: HTMLCanvasElement) {
        const gradient = { addColorStop: vi.fn() };
        const baseContext = {
          canvas: this,
          setTransform: vi.fn(),
          resetTransform: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          scale: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          bezierCurveTo: vi.fn(),
          quadraticCurveTo: vi.fn(),
          arc: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          clip: vi.fn(),
          rect: vi.fn(),
          setLineDash: vi.fn(),
          fillText: vi.fn(),
          strokeText: vi.fn(),
          createLinearGradient: vi.fn(() => gradient),
          createRadialGradient: vi.fn(() => gradient),
          measureText: vi.fn(() => ({ width: 10 })),
        };
        return new Proxy(baseContext, {
          get(target, prop) {
            if (prop in target) {
              return target[prop as keyof typeof target];
            }
            return vi.fn();
          },
        }) as unknown as CanvasRenderingContext2D;
      });
  });

  afterAll(() => {
    getContextSpy.mockRestore();
  });

  beforeEach(async () => {
    TestBed.overrideComponent(SensorsDataChartComponent, {
      set: { template: '' },
    });

    await TestBed.configureTestingModule({
      imports: [SensorsDataChartComponent],
      providers: [
        { provide: SensorsDataService, useValue: mockSensorsDataService },
        { provide: ThemeService, useClass: MockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorsDataChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('canExport should be true for non-custom period and false when exporting', () => {
    const c = component as unknown as ChartComponentTestApi;

    expect(c.canExport()).toBe(true);

    c.isExporting.set(true);
    expect(c.canExport()).toBe(false);
  });

  it('canExport should require both custom dates', () => {
    const c = component as unknown as ChartComponentTestApi;

    c.onPeriodChange(SensorDataPeriod.Custom);
    c.onDateFromChange(new Date('2026-01-01T00:00:00.000Z'));
    c.onDateToChange(null);
    expect(c.canExport()).toBe(false);

    c.onDateToChange(new Date('2026-01-02T00:00:00.000Z'));
    expect(c.canExport()).toBe(true);
  });

  it('chartJsData should map labels and all datasets', () => {
    const c = component as unknown as ChartComponentTestApi;

    const data = c.chartJsData();

    expect(data.labels?.length).toBe(1);
    expect(data.datasets).toHaveLength(3);
    expect(data.datasets[0].label).toBe('Min');
    expect(data.datasets[1].label).toBe('Max');
    expect(data.datasets[2].label).toBe('Avg');
  });

  it('tooltip callbacks should handle valid and out-of-range index', () => {
    const c = component as unknown as ChartComponentTestApi;
    c.onPeriodChange(SensorDataPeriod.Week);
    c.onSensorTypeChange(SensorType.Temperature);

    const options = c.chartOptions();
    const callbacks = options.plugins?.tooltip?.callbacks;
    const tooltipThis = {} as TooltipModel<'line'>;

    const validItems = [{ dataIndex: 0 }] as TooltipItem<'line'>[];
    const invalidItems = [{ dataIndex: 99 }] as TooltipItem<'line'>[];
    const validTitle = callbacks?.title?.call(tooltipThis, validItems);
    const invalidTitle = callbacks?.title?.call(tooltipThis, invalidItems);
    const validAfterBody = callbacks?.afterBody?.call(tooltipThis, validItems);
    const invalidAfterBody = callbacks?.afterBody?.call(tooltipThis, invalidItems);

    expect(typeof validTitle).toBe('string');
    expect(validTitle).not.toBe('');
    expect(invalidTitle).toBe('');
    expect(validAfterBody).toEqual(['Avg: 10', 'Min: 8', 'Max: 12']);
    expect(invalidAfterBody).toEqual([]);
  });
});
