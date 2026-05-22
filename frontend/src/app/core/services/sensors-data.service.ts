import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SensorsData } from '@/core/models/sensors-data.model';
import { AggregatedDataPoint } from '@/core/models/aggregated-data-point.model';
import { AggregatedDataParams } from '@/core/models/aggregated-data-params.model';

@Injectable({ providedIn: 'root' })
export class SensorsDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.serverApiUrl;

  getLatestData(): Observable<SensorsData> {
    return this.http.get<SensorsData>(`${this.baseUrl}/weather-measurements/latest`);
  }

  getAggregatedData(params: AggregatedDataParams): Observable<AggregatedDataPoint[]> {
    if ('from' in params) {
      return this.http.get<AggregatedDataPoint[]>(
        `${this.baseUrl}/weather-measurements/aggregated`,
        {
          params: {
            from: params.from.toISOString(),
            to: params.to.toISOString(),
            type: params.type,
          },
        },
      );
    }
    return this.http.get<AggregatedDataPoint[]>(`${this.baseUrl}/weather-measurements/aggregated`, {
      params: { period: params.period, type: params.type },
    });
  }
}
