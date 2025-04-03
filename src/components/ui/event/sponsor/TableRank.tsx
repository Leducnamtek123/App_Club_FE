"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  CircularProgress,
} from "@heroui/react";
import { useState, useEffect } from "react";

// Hàm định dạng số: loại bỏ .00 nếu là số nguyên
const formatNumberDisplay = (value) => {
  if (!value) return "0";
  const num = parseFloat(value);
  return num % 1 === 0
    ? num.toLocaleString("vi-VN")
    : parseFloat(num.toFixed(2)).toLocaleString("vi-VN");
};

// Thứ tự tier cố định
const tierOrder = ["Kim cương", "Vàng", "Bạc", "Đồng", "Đồng hành"];

export default function TableRank({ data }) {
  const [rankData, setRankData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Xử lý khi data thay đổi
  useEffect(() => {
    setIsLoading(true);
    // Sắp xếp data theo thứ tự tierOrder
    const sortedData = data?.slice().sort((a, b) => {
      const tierA = a.tier || "Đồng hành";
      const tierB = b.tier || "Đồng hành";
      return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
    });
    setRankData(sortedData);
    setIsLoading(false);
  }, [data]);

  console.log("Data nhận được:", data);

  // Nếu không có dữ liệu hoặc đang tải, hiển thị loading
  if (isLoading || !rankData) {
    return (
      <div className="flex justify-center">
        <CircularProgress aria-label="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rankData.length > 0 ? (
        rankData.map((tierData) => {
          const tierName = tierData.tier || "Đồng hành";
          const sponsors = tierData.sponsors || [];

          // Sắp xếp sponsors theo amount giảm dần
          const sortedSponsors = [...sponsors].sort(
            (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
          );

          return (
            <div key={tierName} className="relative">
              <h3
                className="absolute top-0 left-4 transform -translate-y-1/2 bg-white px-2 text-lg font-semibold text-gray-700"
              >
                {tierName} ({sortedSponsors.length} nhà tài trợ)
              </h3>
              <Table
                aria-label={`Sponsor Ranking Table for ${tierName}`}
                className="min-w-full pt-4"
              >
                <TableHeader>
                  <TableColumn width="40%">Nhà Tài Trợ</TableColumn>
                  <TableColumn width="60%">Số Tiền (VNĐ)</TableColumn>
                </TableHeader>
                <TableBody>
                  {sortedSponsors.length > 0 ? (
                    sortedSponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell>{sponsor.sponsor.name}</TableCell>
                        <TableCell>{formatNumberDisplay(sponsor.amount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell>Không có nhà tài trợ</TableCell>
                      <TableCell>{""}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          );
        })
      ) : (
        <p>Chưa có dữ liệu nhà tài trợ.</p>
      )}
    </div>
  );
}