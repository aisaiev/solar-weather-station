import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ChartData,
  BarElement,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SensorType } from '../../sensors-data-chart/models/sensor-type.model';

function BarChart({
  data,
  sensorType,
}: {
  data: ChartData<'bar'>;
  sensorType: SensorType;
}) {
  ChartJS.register(CategoryScale, LinearScale, BarElement);

  const options: ChartOptions = {
    responsive: true,
  };

  if (sensorType === SensorType.BatteryCharging) {
    options.plugins = {
      tooltip: {
        enabled: false,
      },
    };
    (options as any).scales = {
      y: {
        min: -1,
        max: 1,
        ticks: {
          stepSize: 1,
          beginAtZero: true,
          callback: (value: number) => {
            if (value === 1) {
              return 'Yes';
            } else if (value === -1) {
              return 'No';
            } else {
              return '';
            }
          },
        },
      },
    };
  }

  return <Bar options={options} data={data} />;
}

export default BarChart;
