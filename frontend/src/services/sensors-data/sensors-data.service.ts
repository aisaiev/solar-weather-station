import { SERVER_API_URL } from '../../constants/app.constants';
import { httpClient } from '../http-client';
import { SensorsData } from './sensors-data.model';

class SensorsDataService {
  private readonly resourceUrl = SERVER_API_URL + '/sensors-data';

  getLatest() {
    return httpClient.get<SensorsData>(`${this.resourceUrl}/latest`);
  }
}

export default new SensorsDataService();
