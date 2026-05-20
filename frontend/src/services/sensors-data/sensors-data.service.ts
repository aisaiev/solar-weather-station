import { SensorType } from '../../components/sensors-data-chart/models/sensor-type.model';
import { SERVER_API_URL } from '../../constants/constants';
import { httpClient } from '../http-client';
import { SensorsData } from './sensors-data.model';
import { SensorsDataUtil } from './sensors-data.util';
import { AggregatedDataPoint } from './aggregated-data-point.model';

class SensorsDataService {
  private readonly resourceUrl = SERVER_API_URL + '/weather-measurements';

  getLatestData() {
    return httpClient.get<SensorsData>(`${this.resourceUrl}/latest`);
  }

  getDataForDay(sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}`);
    url.searchParams.append('period', 'day');
    url.searchParams.append(
      'type',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<Record<string, number>[]>(url.toString());
  }

  getDataForWeek(sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}`);
    url.searchParams.append('period', 'week');
    url.searchParams.append(
      'type',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<Record<string, number>[]>(url.toString());
  }

  getDataForMonth(sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}`);
    url.searchParams.append('period', 'month');
    url.searchParams.append(
      'type',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<Record<string, number>[]>(url.toString());
  }

  getAggregatedData(period: string, sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}/aggregated`);
    url.searchParams.append('period', period.toLowerCase());
    url.searchParams.append(
      'type',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<AggregatedDataPoint[]>(url.toString());
  }
}

export default new SensorsDataService();
