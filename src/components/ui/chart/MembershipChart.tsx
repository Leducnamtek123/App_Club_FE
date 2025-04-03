import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Select, SelectItem } from '@heroui/react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MembershipChart = ({ branchData }) => {
  // Dữ liệu mẫu mở rộng với nhiều năm hơn
  const allYears = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'];
  const allPaid = [40, 45, 50, 55, 60, 65, 70, 75];
  const allUnpaid = [25, 20, 18, 15, 12, 10, 8, 5];

  // State để quản lý khoảng năm được chọn
  const [startYear, setStartYear] = useState('2020');
  const [endYear, setEndYear] = useState('2027');

  // Lọc dữ liệu theo khoảng năm được chọn
  const startIndex = allYears.indexOf(startYear);
  const endIndex = allYears.indexOf(endYear) + 1; // +1 để bao gồm năm kết thúc
  const filteredYears = allYears.slice(startIndex, endIndex);
  const filteredPaid = allPaid.slice(startIndex, endIndex);
  const filteredUnpaid = allUnpaid.slice(startIndex, endIndex);

  const data = {
    labels: filteredYears,
    datasets: [
      { label: 'Đã đóng', data: filteredPaid, backgroundColor: 'rgba(75, 192, 192, 0.5)' },
      { label: 'Chưa đóng', data: filteredUnpaid, backgroundColor: 'rgba(255, 99, 132, 0.5)' },
    ],
  };

  const options = {
    scales: { y: { beginAtZero: true } },
    responsive: true,
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Số lượng người đóng/chưa đóng</h3>
      
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

      <Bar data={data} options={options} />
    </div>
  );
};

export default MembershipChart;