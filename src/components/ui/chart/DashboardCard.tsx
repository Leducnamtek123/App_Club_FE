"use client"; // Nếu dùng Next.js với App Router

import { getBranches } from "@/services/branch/branchServices";
import { getAllEvents } from "@/services/event/eventServices";
import { getApprovedUser } from "@/services/membership/membershipServices";
import { getAllNews } from "@/services/news/newsServices";
import React, { useEffect, useState } from "react";
import { MdPeople, MdEvent, MdArticle, MdBusiness } from "react-icons/md";

interface CardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const InfoCard: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-5 flex items-center gap-4 flex-1 min-w-0 transform transition-transform hover:scale-105 cursor-pointer border border-gray-200">
      <div
        className="rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="overflow-hidden">
        <h3 className="text-sm text-gray-600 font-normal m-0 truncate">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
};

const DashboardCards: React.FC = () => {
  const [filtersUser, setFiltersUser] = useState({
    q: "",
    page: 1,
    take: 10,
    order: undefined,
    branchId: undefined,
  });

  const [filtersEvent, setFiltersEvent] = useState({
    search: "",
    branchId: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    take: 12,
  });

  const [memberCount, setMemberCount] = useState<number | undefined>(undefined);
  const [eventCount, setEventCount] = useState<number | undefined>(undefined);
  const [newsCount, setNewsCount] = useState<number | undefined>(undefined);
  const [branchCount, setBranchCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          membershipResponse,
          eventResponse,
          newsResponse,
          branchResponse,
        ] = await Promise.all([
          getApprovedUser(filtersUser),
          getAllEvents(filtersEvent),
          getAllNews(filtersEvent),
          getBranches(),
        ]);

        setMemberCount(membershipResponse.meta?.itemCount);
        setEventCount(eventResponse.meta?.itemCount);
        setNewsCount(newsResponse.meta?.itemCount);
        setBranchCount(branchResponse.meta?.itemCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, [filtersUser, filtersEvent]); // Dependency array để gọi lại khi filter thay đổi

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="Tổng hội viên"
          value={memberCount ?? 350} // Giá trị mặc định nếu chưa tải xong
          icon={<MdPeople size={24} />}
          color="#00E396"
        />
        <InfoCard
          title="Sự kiện"
          value={eventCount ?? 12}
          icon={<MdEvent size={24} />}
          color="#FF4560"
        />
        <InfoCard
          title="Tin tức"
          value={newsCount ?? 25}
          icon={<MdArticle size={24} />}
          color="#1E90FF"
        />
        <InfoCard
          title="Chi hội"
          value={branchCount ?? 8}
          icon={<MdBusiness size={24} />}
          color="#FFD700"
        />
      </div>
    </div>
  );
};

export default DashboardCards;
