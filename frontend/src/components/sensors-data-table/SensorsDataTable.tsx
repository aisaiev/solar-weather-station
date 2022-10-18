import { useEffect, useState } from 'react';
import { SensorsData } from '../../services/sensors-data/sensors-data.model';
import {
  booleanToYesNo,
  convertDateStringToKyivTimeString,
  formatNumberPrecission,
  getKyivLocalTimeString,
} from '../../utils/formatter.util';
import SensorsDataService from '../../services/sensors-data/sensors-data.service';

function SensorsDataTable() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [sensorsData, setSensorsData] = useState<SensorsData>();

  const getLatestSensorsData = async () => {
    setIsDataLoading(true);
    const { data } = await SensorsDataService.getLatestData();
    setSensorsData(data);
    setIsDataLoading(false);
  };

  useEffect(() => {
    getLatestSensorsData();
  }, []);

  return (
    <table>
      <tbody>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-clock"></i> Local time
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData && getKyivLocalTimeString()}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-clock-rotate-left"></i> Last updated on
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData &&
                convertDateStringToKyivTimeString(sensorsData?.date)}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-microchip"></i> MCU
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData && sensorsData?.mcu}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-wave-square"></i> CPU frequency
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData && sensorsData?.cpuFrequency} {sensorsData && 'MHz'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-memory"></i> RAM usage
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData &&
                formatNumberPrecission(sensorsData?.ramUsagePercent, 0)}{' '}
              {sensorsData && '% ('}
              {sensorsData &&
                formatNumberPrecission(sensorsData?.ramUsageKb, 0)}{' '}
              {sensorsData && 'KB)'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-temperature-empty"></i> Temperature
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData &&
                formatNumberPrecission(sensorsData?.temperature, 1)}{' '}
              {sensorsData && '°C'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-droplet"></i> Humidity
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData && formatNumberPrecission(sensorsData?.humidity, 1)}{' '}
              {sensorsData && '%'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-arrow-down-short-wide"></i> Pressure
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData && formatNumberPrecission(sensorsData?.pressure, 1)}{' '}
              {sensorsData && 'hPa'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-bolt"></i> Battery voltage
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData &&
                formatNumberPrecission(sensorsData?.batteryVoltage, 1)}{' '}
              {sensorsData && 'V'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-battery-full"></i> Battery level
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData &&
                formatNumberPrecission(sensorsData?.batteryLevel, 0)}{' '}
              {sensorsData && '%'}
            </span>
          </td>
        </tr>
        <tr>
          <td className="white-space-nowrap">
            <i className="fa-solid fa-solar-panel"></i> Battery charging
          </td>
          <td>
            <span aria-busy={isDataLoading}>
              {sensorsData && booleanToYesNo(sensorsData?.batteryCharging)}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default SensorsDataTable;
