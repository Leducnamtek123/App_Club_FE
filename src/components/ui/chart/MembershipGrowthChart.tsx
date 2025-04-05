'use client'; // Đánh dấu đây là Client Component trong Next.js

import { getGrowthUserReport } from "@/services/report/reportServices";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";


// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const MembershipGrowthChart = () => {
  const [chartData, setChartData] = useState({
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    datasets: [
      {
        label: "Hội viên",
        data: [0, 0, 0, 0, 0, 0],
        borderColor: "#00E396",
        backgroundColor: "rgba(0, 227, 150, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    try {
      const response = await getGrowthUserReport({});
      const yearData = response.data || response; // Điều chỉnh nếu API trả về dạng { data: [...] }

      // Khởi tạo mảng dữ liệu cho các năm
      const yearCounts = {
        2020: 0,
        2021: 0,
        2022: 0,
        2023: 0,
        2024: 0,
        2025: 0,
      };

      // Cập nhật số lượng hội viên theo năm từ dữ liệu API
      yearData.forEach((item) => {
        const year = item.year;
        if (year >= 2020 && year <= 2025) {
          yearCounts[year] = item.userCount;
        }
      });

      // Cập nhật chartData
      setChartData({
        labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
        datasets: [
          {
            label: "Hội viên",
            data: Object.values(yearCounts), // Chuyển object thành mảng giá trị
            borderColor: "#00E396",
            backgroundColor: "rgba(0, 227, 150, 0.2)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching growth report:", error);
    }
  };

  // Gọi fetchData khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Cấu hình options cho chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} hội viên`,
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
        beginAtZero: true,
      },
    },
  };

  return (
   
        <Line data={chartData} options={options} />
   
  );
};

export default MembershipGrowthChart;