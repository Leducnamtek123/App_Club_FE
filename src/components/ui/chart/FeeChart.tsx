"use client"; // Thêm directive này vì Chart.js cần chạy phía client

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FeeChart = ({ feeData }: any) => {
  const [years, setYears] = useState([]);
  const [fees, setFees] = useState([]);

  // Giả lập dữ liệu API (bạn có thể thay bằng fetch thật)
  useEffect(() => {
    // Xử lý dữ liệu từ API
    const yearData = feeData?.yearlyFees.map((item) => item.year);
    const feeDatas = feeData?.yearlyFees.map((item) => item.totalAmount);

    setYears(yearData);
    setFees(feeDatas);
  }, [feeData]);

  // Cấu hình dữ liệu cho biểu đồ
  const data = {
    labels: years,
    datasets: [
      {
        label: "Tổng hội phí (VND)",
        data: fees,
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Tổng hội phí qua các năm theo chi hội</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default FeeChart;
