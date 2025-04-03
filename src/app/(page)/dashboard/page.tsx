"use client";

import DashboardCards from "@/components/ui/chart/DashboardCard";
import MembershipAllFeeChart from "@/components/ui/chart/MembershipAllFeeChart";
import MembershipGrowthChart from "@/components/ui/chart/MembershipGrowthChart";
import WebSocketComponent from "@/components/ui/WsComponent";

export default function Page() {
  return (
    <div className="w-full p-5 space-y-5">
      {/* <WebSocketComponent></WebSocketComponent> */}
      <DashboardCards />
      <div className="w-full flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-1/2 bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
          <div className="font-bold text-lg mb-4">
            <p>Tổng quan về đóng phí</p>
          </div>
          <div className="w-full overflow-hidden">
            <MembershipAllFeeChart />
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
          <div className="font-bold text-lg mb-4">
            <p>Biểu đồ tăng trưởng hội viên</p>
          </div>
          <div className="w-full overflow-hidden">
            <MembershipGrowthChart />
          </div>
        </div>
      </div>
    </div>
  );
}
