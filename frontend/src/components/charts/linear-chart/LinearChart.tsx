import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  ChartData,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { formatUvPower } from '../../../utils/formatter.util';
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

  if (sensorType === SensorType.UVPower) {
    options.plugins!.tooltip = {
      callbacks: {
        label: function (context: TooltipItem<'line'>) {
          return `${formatUvPower(context.raw as number)}`;
        },
      },
    };
  }

  return <Line options={options} data={data} />;
}

export default LinearChart;
