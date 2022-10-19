import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

function LinearChart({ data }: { data: ChartData<'line'> }) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    zoomPlugin,
  );

  const options = {
    plugins: {
      legend: {
        display: false,
      },
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
