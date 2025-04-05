import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { getAllMemberFee } from "@/services/membership/membershipServices";

// Đăng ký các thành phần cần thiết
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MembershipAllFeeChart: React.FC = () => {
  const [chartData, setChartData] = useState({
    labels: ["2023", "2024", "2025"],
    datasets: [
      {
        label: "Đã đóng phí",
        data: [0, 0, 0], // Giá trị mặc định
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Chưa đóng phí",
        data: [0, 0, 0], // Giá trị mặc định
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  });
  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    take: 10,
    branchId: undefined,
    order: undefined,
    startYear: undefined,
    endYear: undefined,
    userId: undefined,
  });
  const [meta, setMeta] = useState({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dữ liệu từ API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getAllMemberFee(filters);
      setData(res.data); // Gán dữ liệu từ API vào state data
      setMeta(res.meta);
    } catch (error) {
      console.error("Error fetching member fees:", error);
      setData([]);
      setMeta({
        page: 1,
        take: 10,
        itemCount: 0,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetchData khi filters thay đổi
  useEffect(() => {
    fetchData();
  }, [filters.page, filters.q, filters.branchId, filters.startYear, filters.endYear, filters.userId]);

  // Transform dữ liệu từ data và cập nhật biểu đồ
  useEffect(() => {
    // Đếm số lượng hội viên đã đóng và chưa đóng phí theo năm
    const paidCounts = { 2023: 0, 2024: 0, 2025: 0 };
    const unpaidCounts = { 2023: 0, 2024: 0, 2025: 0 };

    data.forEach((member) => {
      member.payments.forEach((payment) => {
        const year = payment.year;
        if (year >= 2023 && year <= 2025) {
          if (payment.status === 1) {
            paidCounts[year]++;
          } else if (payment.status === 0) {
            unpaidCounts[year]++;
          }
        }
      });
    });

    // Cập nhật dữ liệu biểu đồ
    setChartData({
      labels: ["2023", "2024", "2025"],
      datasets: [
        {
          label: "Đã đóng phí",
          data: [paidCounts[2023], paidCounts[2024], paidCounts[2025]],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Chưa đóng phí",
          data: [unpaidCounts[2023], unpaidCounts[2024], unpaidCounts[2025]],
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    });
  }, [data]); // Dependency là data, chạy lại khi data thay đổi

  // Cấu hình tùy chọn biểu đồ
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} hội viên`,
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

  // Hiển thị loading state nếu đang fetch dữ liệu
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Thống kê tình trạng hội phí theo năm</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MembershipAllFeeChart;