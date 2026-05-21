import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SensorsData } from '@/core/models/sensors-data.model';
import { AggregatedDataPoint } from '@/core/models/aggregated-data-point.model';
import { SensorDataPeriod } from '@/core/models/sensor-data-period.enum';
import { SensorType } from '@/core/models/sensor-type.enum';

@Injectable({ providedIn: 'root' })
export class SensorsDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.serverApiUrl;

  getLatestData(): Observable<SensorsData> {
    return this.http.get<SensorsData>(`${this.baseUrl}/weather-measurements/latest`);
  }

  getAggregatedData(period: SensorDataPeriod, type: SensorType): Observable<AggregatedDataPoint[]> {
    return this.http.get<AggregatedDataPoint[]>(`${this.baseUrl}/weather-measurements/aggregated`, {
      params: { period, type },
    });
  }
}
