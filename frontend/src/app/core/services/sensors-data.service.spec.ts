import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SensorsDataService } from './sensors-data.service';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { SensorType } from '@/core/models/sensor-type.enum';
import { ExportScope } from '@/core/models/export-scope.enum';
import { environment } from '../../../environments/environment';

describe('SensorsDataService', () => {
  let service: SensorsDataService;
  let httpMock: HttpTestingController;
  const originalEventSource = globalThis.EventSource;

  class MockEventSource {
    static instances: MockEventSource[] = [];
    public readonly listeners = new Map<string, ((event: Event) => void)[]>();
    public closed = false;

    constructor(public readonly url: string) {
      MockEventSource.instances.push(this);
    }

    addEventListener(type: string, listener: (event: Event) => void): void {
      const current = this.listeners.get(type) ?? [];
      this.listeners.set(type, [...current, listener]);
    }

    close(): void {
      this.closed = true;
    }

    emit(type: string, data: string): void {
      const callbacks = this.listeners.get(type) ?? [];
      const event = { data } as MessageEvent<string>;
      callbacks.forEach((callback) => callback(event as unknown as Event));
    }
  }

  beforeEach(() => {
    MockEventSource.instances = [];
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SensorsDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    globalThis.EventSource = originalEventSource;
  });

  it('streamLatestData should emit parsed measurement and close source on unsubscribe', () => {
    const nextSpy = vi.fn();
    const subscription = service.streamLatestData().subscribe(nextSpy);

    expect(MockEventSource.instances).toHaveLength(1);
    const source = MockEventSource.instances[0];
    expect(source.url).toBe(`${environment.serverApiUrl}/weather-measurements/stream`);

    source.emit(
      'measurement',
      JSON.stringify({ date: '2026-01-01T00:00:00.000Z', temperature: 20 }),
    );

    expect(nextSpy).toHaveBeenCalledWith({ date: '2026-01-01T00:00:00.000Z', temperature: 20 });

    subscription.unsubscribe();
    expect(source.closed).toBe(true);
  });

  it('getLatestData should call latest endpoint', () => {
    service.getLatestData().subscribe();

    const req = httpMock.expectOne(`${environment.serverApiUrl}/weather-measurements/latest`);
    expect(req.request.method).toBe('GET');
    req.flush({ date: '2026-01-01T00:00:00.000Z' });
  });

  it('getAggregatedData should send period mode params', () => {
    service
      .getAggregatedData({ period: SensorDataPeriod.Week, type: SensorType.Humidity })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.serverApiUrl}/weather-measurements/aggregated` &&
        r.params.get('period') === SensorDataPeriod.Week &&
        r.params.get('type') === SensorType.Humidity,
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAggregatedData should send custom mode ISO params', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const to = new Date('2026-01-02T00:00:00.000Z');

    service.getAggregatedData({ from, to, type: SensorType.Pressure }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.serverApiUrl}/weather-measurements/aggregated` &&
        r.params.get('from') === from.toISOString() &&
        r.params.get('to') === to.toISOString() &&
        r.params.get('type') === SensorType.Pressure,
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('exportCsv should send period params and blob response type', () => {
    service
      .exportCsv({
        period: SensorDataPeriod.Day,
        scope: ExportScope.Selected,
        type: SensorType.Temperature,
      })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.serverApiUrl}/weather-measurements/export` &&
        r.params.get('period') === SensorDataPeriod.Day &&
        r.params.get('scope') === ExportScope.Selected &&
        r.params.get('type') === SensorType.Temperature,
    );

    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['csv']));
  });

  it('exportCsv should send custom params and omit type when not provided', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const to = new Date('2026-01-02T00:00:00.000Z');

    service
      .exportCsv({
        from,
        to,
        scope: ExportScope.All,
      })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.serverApiUrl}/weather-measurements/export` &&
        r.params.get('from') === from.toISOString() &&
        r.params.get('to') === to.toISOString() &&
        r.params.get('scope') === ExportScope.All &&
        !r.params.has('type'),
    );

    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['csv']));
  });
});
