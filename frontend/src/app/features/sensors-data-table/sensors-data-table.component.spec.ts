import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { SensorsDataTableComponent } from './sensors-data-table.component';
import { SensorsDataService } from '@/core/services/sensors-data.service';
import { SensorsData } from '@/core/models/sensors-data.model';

type TableComponentTestApi = {
  isLoading: () => boolean;
  currentTime: () => string;
  cpuFrequency: () => string;
  ram: () => string;
  cards: () => Array<{ rows: Array<{ value: string }> }>;
  temperature: () => string;
};

describe('SensorsDataTableComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should expose loading state and fallbacks when no data', async () => {
    const live$ = new Subject<SensorsData>();
    await TestBed.configureTestingModule({
      imports: [SensorsDataTableComponent],
      providers: [
        {
          provide: SensorsDataService,
          useValue: {
            getLatestData: vi.fn(() => of(null)),
            streamLatestData: vi.fn(() => live$),
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<SensorsDataTableComponent> =
      TestBed.createComponent(SensorsDataTableComponent);
    const component = fixture.componentInstance as unknown as TableComponentTestApi;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(component.cpuFrequency()).toBe('—');
    expect(component.ram()).toBe('—');
    expect(component.cards().length).toBe(5);
    expect(component.cards()[0].rows[2].value).toBe('—');
  });

  it('should compute CPU, RAM, and card values from data', async () => {
    const live$ = new Subject<SensorsData>();
    await TestBed.configureTestingModule({
      imports: [SensorsDataTableComponent],
      providers: [
        {
          provide: SensorsDataService,
          useValue: {
            getLatestData: vi.fn(() =>
              of({
                date: '2026-01-01T00:00:00.000Z',
                mcu: 'ESP32-S3',
                cpuFrequency: 240,
                ramUsageKb: 120,
                ramUsagePercent: 33.4,
                temperature: 21.6,
                humidity: 54.2,
              }),
            ),
            streamLatestData: vi.fn(() => live$),
          },
        },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<SensorsDataTableComponent> =
      TestBed.createComponent(SensorsDataTableComponent);
    const component = fixture.componentInstance as unknown as TableComponentTestApi;
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.cpuFrequency()).toBe('240 MHz');
    expect(component.ram()).toBe('33% (120 KB)');
    expect(component.cards()[0].rows[2].value).toBe('ESP32-S3');
    expect(component.temperature()).toContain('°C');

    live$.next({
      date: '2026-01-01T00:10:00.000Z',
      mcu: 'ESP32-S3',
      cpuFrequency: 160,
      ramUsageKb: 200,
      ramUsagePercent: 50,
      temperature: 25,
      humidity: 55,
    });
    fixture.detectChanges();

    expect(component.cpuFrequency()).toBe('160 MHz');
    expect(component.ram()).toBe('50% (200 KB)');

    const previousTime = component.currentTime();
    vi.advanceTimersByTime(60_000);
    fixture.detectChanges();

    expect(component.currentTime()).not.toBe('');
    expect(component.currentTime()).not.toBe(previousTime);
  });
});
