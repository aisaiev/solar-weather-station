import { SERVER_API_URL } from '../../constants/constants';
import { httpClient } from '../http-client';
import { SensorsData } from './sensors-data.model';

class SensorsDataService {
  private readonly resourceUrl = SERVER_API_URL + '/sensors-data';

  getLatestData() {
    return httpClient.get<SensorsData>(`${this.resourceUrl}/latest`);
  }

  getDataForDay() {
    return httpClient.get<SensorsData[]>(`${this.resourceUrl}/day`);
  }

  getDataForWeek() {
    return httpClient.get<SensorsData[]>(`${this.resourceUrl}/week`);
  }

  getDataForMonth() {
    return httpClient.get<SensorsData[]>(`${this.resourceUrl}/month`);
  }
}

export default new SensorsDataService();
