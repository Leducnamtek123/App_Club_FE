"use client"; // Thêm directive này vì Chart.js cần chạy phía client

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Định nghĩa kiểu dữ liệu cho eventData
interface EventData {
  branch: string | null;
  yearlyEvents: { year: number; eventCount: number }[];
}

const EventChart = ({ eventData }: { eventData: EventData }) => {
  // Lấy dữ liệu từ eventData.yearlyEvents
  const years = eventData?.yearlyEvents?.map((item) => item.year) || [];
  const eventCounts = eventData?.yearlyEvents?.map((item) => item.eventCount) || [];

  const data = {
    labels: years, // Trục X: các năm
    datasets: [
      {
        label: "Số sự kiện",
        data: eventCounts, // Trục Y: số sự kiện
        backgroundColor: "rgba(153, 102, 255, 0.5)", // Màu nền cột
        borderColor: "rgba(153, 102, 255, 1)", // Viền cột
        borderWidth: 1, // Độ dày viền
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Đảm bảo giá trị trên trục Y là số nguyên
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Vị trí của chú thích
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw} sự kiện`, // Hiển thị đơn vị trong tooltip
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Số sự kiện qua các năm</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default EventChart;