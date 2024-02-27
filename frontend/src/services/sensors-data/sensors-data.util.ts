import { SensorType } from '../../components/sensors-data-chart/models/sensor-type.model';

export class SensorsDataUtil {
    public static convertUiSensorTypeToApiSensorType(sensorType: SensorType): string {
        switch (sensorType) {
            case SensorType.Temperature:
                return 'temperature';
            case SensorType.Humidity:
                return 'humidity';
            case SensorType.Pressure:
                    return 'pressure';
            case SensorType.InternalTemperature:
                return 'internalTemperature';
            case SensorType.InternalHumidity:
                return 'internalHumidity';
            case SensorType.Illuminance:
                return 'illuminance';
            case SensorType.BatteryVoltage:
                return 'batteryVoltage';
            case SensorType.BatteryLevel:
                return 'batteryLevel';
            default:
                return '';
        }
    }
}