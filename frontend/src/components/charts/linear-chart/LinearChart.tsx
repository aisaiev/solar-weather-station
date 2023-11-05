import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { SensorType } from '../../sensors-data-chart/models/sensor-type.model';

function LinearChart({
  data,
  sensorType,
}: {
  data: ChartData<'line'>;
  sensorType: SensorType;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    zoomPlugin,
  );

  const options: ChartOptions = {
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
        zoom: {
          wheel: {
            enabled: true,
            modifierKey: 'ctrl' as const,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
      },
    },
    responsive: true,
  };

  return <Line options={options} data={data} />;
}

export default LinearChart;
