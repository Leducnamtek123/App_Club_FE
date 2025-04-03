import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MembershipAllFeeChart: React.FC = () => {
  const data = {
    labels: ["2023", "2024", "2025"],
    datasets: [
      {
        label: "Đã đóng phí",
        data: [50, 60, 55],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Chưa đóng phí",
        data: [30, 20, 25],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return <Bar data={data} />;
};

export default  MembershipAllFeeChart;