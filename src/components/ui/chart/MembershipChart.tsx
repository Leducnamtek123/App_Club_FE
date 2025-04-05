import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Select, SelectItem } from '@heroui/react';
import { getAllMemberFee } from '@/services/membership/membershipServices';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MembershipChart = ({ branchData }) => {
  // Danh sách các năm
  const allYears = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'];

  // State để quản lý khoảng năm được chọn và dữ liệu biểu đồ
  const [startYear, setStartYear] = useState('2020');
  const [endYear, setEndYear] = useState('2027');
  const [chartData, setChartData] = useState({
    labels: allYears,
    datasets: [
      { label: 'Đã đóng', data: [], backgroundColor: 'rgba(75, 192, 192, 0.5)' },
      { label: 'Chưa đóng', data: [], backgroundColor: 'rgba(255, 99, 132, 0.5)' },
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


  // Fetch và transform dữ liệu
  useEffect(() => {

      // Khởi tạo object để đếm số lượng theo năm
      const yearCounts = {
        2020: { paid: 0, unpaid: 0 },
        2021: { paid: 0, unpaid: 0 },
        2022: { paid: 0, unpaid: 0 },
        2023: { paid: 0, unpaid: 0 },
        2024: { paid: 0, unpaid: 0 },
        2025: { paid: 0, unpaid: 0 },
        2026: { paid: 0, unpaid: 0 },
        2027: { paid: 0, unpaid: 0 },
      };

      // Đếm số lượng "Đã đóng" và "Chưa đóng" theo năm
     data.forEach((member) => {
        const year = new Date(member.createdAt).getFullYear();
        if (year >= 2020 && year <= 2027) {
          if (member.status === 'approved') {
            yearCounts[year].paid++;
          } else if (member.status === 'pending') {
            yearCounts[year].unpaid++;
          }
        }
      });

      // Tạo mảng dữ liệu cho biểu đồ
      const paidData = allYears.map((year) => yearCounts[year].paid);
      const unpaidData = allYears.map((year) => yearCounts[year].unpaid);

      // Lọc dữ liệu theo khoảng năm được chọn
      const startIndex = allYears.indexOf(startYear);
      const endIndex = allYears.indexOf(endYear) + 1;
      const filteredYears = allYears.slice(startIndex, endIndex);
      const filteredPaid = paidData.slice(startIndex, endIndex);
      const filteredUnpaid = unpaidData.slice(startIndex, endIndex);

      // Cập nhật dữ liệu biểu đồ
      setChartData({
        labels: filteredYears,
        datasets: [
          { label: 'Đã đóng', data: filteredPaid, backgroundColor: 'rgba(75, 192, 192, 0.5)' },
          { label: 'Chưa đóng', data: filteredUnpaid, backgroundColor: 'rgba(255, 99, 132, 0.5)' },
        ],
      });
    

    fetchData();
  }, [startYear, endYear]); // Cập nhật khi startYear hoặc endYear thay đổi

  const options = {
    scales: { y: { beginAtZero: true } },
    responsive: true,
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Số lượng người đóng/chưa đóng theo chi hội</h3>
      
      {/* Bộ lọc khoảng năm với HeroUI Select */}
      <div className="mb-4 flex gap-4">
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Từ năm:</label>
          <Select
            aria-label='startyear'
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            placeholder="Chọn năm"
            className="w-full"
          >
            {allYears.map((year) => (
              <SelectItem
                key={year}
                isDisabled={year > endYear}
              >
                {year}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Đến năm:</label>
          <Select
            aria-label='endyear'
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            placeholder="Chọn năm"
            className="w-full"
          >
            {allYears.map((year) => (
              <SelectItem
                key={year}
                isDisabled={year < startYear}
              >
                {year}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MembershipChart;