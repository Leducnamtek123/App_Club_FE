import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";

// Đăng ký các thành phần cần thiết
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const MembershipGrowthChart: React.FC = () => {
  // Dữ liệu và cấu hình biểu đồ
  const data = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"], // Các năm
    datasets: [
      {
        label: "Hội viên",
        data: [100, 120, 170, 248, 260, 350], // Số lượng hội viên
        borderColor: "#00E396", // Màu đường: xanh lá
        backgroundColor: "rgba(0, 227, 150, 0.2)", // Màu nền dưới đường
        fill: true, // Điền màu dưới đường
        tension: 0.4, // Đường cong mượt mà
        pointRadius: 4, // Kích thước điểm
        pointHoverRadius: 6, // Kích thước điểm khi hover
      },
    ],
  };

  // Cấu hình tùy chọn
  const options: import("chart.js").ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Chú thích ở trên
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} hội viên`, // Hiển thị giá trị trong tooltip
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Năm",
        },
      },
      y: {
        title: {
          display: true,
          text: "Số lượng hội viên",
        },
        beginAtZero: false, // Không bắt đầu từ 0 để rõ xu hướng
      },
    },
  };

  return (
    <div>
      <h2>Tăng trưởng hội viên theo năm</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default MembershipGrowthChart;