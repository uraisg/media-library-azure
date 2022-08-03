import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const options = {
  responsive: true
};

const UploadComparison = (props) => {
  const year = new Date().getFullYear()

  const labels = props.uploadComparison.Month
  const data = {
    labels,
    datasets: [
      {
        label: year,
        data: props.uploadComparison.Current,
        fill: false,
        borderColor: '#2F4858',
        backgroundColor: '#2F4858',
        tension: 0.1
      },
      {
        label: year-1,
        data: props.uploadComparison.Past,
        fill: false,
        borderColor: '#F1485B',
        backgroundColor: '#F1485B',
        tension: 0.1
      },
    ],
  };

  return (
    <div className="shadowHover shadow mt-3 pb-2 pb-5-responsive bg-white rounded">
        <p className="text-primary">Upload comparison with past year</p>

        <hr />

        <Line options={options} data={data} height={100} />
    </div>
  )
}

export default UploadComparison
