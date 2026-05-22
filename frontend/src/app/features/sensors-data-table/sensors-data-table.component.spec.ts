import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SensorsDataTableComponent } from './sensors-data-table.component';
import { SensorsDataService } from '@/core/services/sensors-data.service';

type TableComponentTestApi = {
  isLoading: () => boolean;
  cpuFrequency: () => string;
  ram: () => string;
  cards: () => Array<{ rows: Array<{ value: string }> }>;
  temperature: () => string;
};

describe('SensorsDataTableComponent', () => {
  it('should expose loading state and fallbacks when no data', async () => {
    await TestBed.configureTestingModule({
      imports: [SensorsDataTableComponent],
      providers: [
        {
          provide: SensorsDataService,
          useValue: { getLatestData: vi.fn(() => of(null)) },
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
  });
});
