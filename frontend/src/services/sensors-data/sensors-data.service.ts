import { SensorType } from '../../components/sensors-data-chart/models/sensor-type.model';
import { SERVER_API_URL } from '../../constants/constants';
import { httpClient } from '../http-client';
import { SensorsData } from './sensors-data.model';
import { SensorsDataUtil } from './sensors-data.util';

class SensorsDataService {
  private readonly resourceUrl = SERVER_API_URL + '/sensors-data';

  getLatestData() {
    return httpClient.get<SensorsData>(`${this.resourceUrl}/latest`);
  }

  getDataForDay(sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}/day`);
    url.searchParams.append(
      'sensorType',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<Record<string, number>[]>(url.toString());
  }

  getDataForWeek(sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}/week`);
    url.searchParams.append(
      'sensorType',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<Record<string, number>[]>(url.toString());
  }

  getDataForMonth(sensorType: SensorType) {
    const url = new URL(`${this.resourceUrl}/month`);
    url.searchParams.append(
      'sensorType',
      SensorsDataUtil.convertUiSensorTypeToApiSensorType(sensorType),
    );
    return httpClient.get<Record<string, number>[]>(url.toString());
  }
}

export default new SensorsDataService();
