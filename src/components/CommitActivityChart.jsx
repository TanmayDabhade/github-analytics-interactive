import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.formattedValue} commits`,
      },
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        tooltipFormat: 'MMM dd',
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

function CommitActivityChart({ dataset }) {
  if (!dataset) {
    return null;
  }

  return (
    <div style={{ height: '320px' }}>
      <h2>Commit cadence</h2>
      <p>
        A rolling 30 day view of commit throughput segmented by repository. Use
        it to spot bursts of activity, lulls, and cross-team collaboration.
      </p>
      <Line data={dataset} options={chartOptions} />
    </div>
  );
}

export default CommitActivityChart;
