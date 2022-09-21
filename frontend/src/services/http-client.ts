import { SERVER_API_URL } from '../constants/app.constants';
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: SERVER_API_URL,
  headers: {
    'Content-type': 'application/json',
  },
});
