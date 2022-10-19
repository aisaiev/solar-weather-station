import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ChartData,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

function BarChart({ data }: { data: ChartData<'bar'> }) {
  ChartJS.register(CategoryScale, LinearScale, BarElement);

  const options = {
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    responsive: true,
    scales: {
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
    },
  } as any;

  return <Bar options={options} data={data} />;
}

export default BarChart;
