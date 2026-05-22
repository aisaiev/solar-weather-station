import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { CreateWeatherMeasurementRequest } from '../dto/create-weather-measurement.request';

@Injectable()
export class WeatherMeasurementsEventsService {
    private readonly measurementCreatedSubject =
        new Subject<CreateWeatherMeasurementRequest>();

    get measurementCreated$(): Observable<CreateWeatherMeasurementRequest> {
        return this.measurementCreatedSubject.asObservable();
    }

    publishMeasurementCreated(
        measurement: CreateWeatherMeasurementRequest,
    ): void {
        this.measurementCreatedSubject.next(measurement);
    }
}
