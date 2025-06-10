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
            case SensorType.BatteryCurrent:
                return 'batteryCurrent';
            case SensorType.BatteryPower:
                return 'batteryPower';
            case SensorType.BatteryLevel:
                return 'batteryLevel';
            case SensorType.SolarPanelVoltage:
                return 'solarPanelVoltage';
            case SensorType.SolarPanelCurrent:
                return 'solarPanelCurrent';
            case SensorType.SolarPanelPower:
                return 'solarPanelPower';
            default:
                return '';
        }
    }
}