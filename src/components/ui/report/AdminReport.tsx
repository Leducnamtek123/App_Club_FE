"use client";

import EventChart from "@/components/ui/chart/EventChart";
import FeeChart from "@/components/ui/chart/FeeChart";
import MembershipChart from "@/components/ui/chart/MembershipChart";
import SponsorTable from "@/components/ui/chart/SponsorTable";
import { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody, Select, SelectItem } from "@heroui/react";
import {
  getEventReport,
  getMembershipFeeByBranch,
  getSponsorRanking,
} from "@/services/report/reportServices";
import { getBranches } from "@/services/branch/branchServices";
import { User } from "@/lib/model/type";

export default function AdminReport() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [year, setYear] = useState("2025");
  const [feeData, setFeeData] = useState<any>();
  const [eventData, setEventData] = useState<any>();
  const [sponsorData, setSponsorData] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    take: 10,
    order: undefined,
    branchId: undefined,
    eventId: undefined,
  });
  const [meta, setMeta] = useState({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Fetch user từ localStorage và set branchId cho ADMIN
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === "ADMIN" && parsedUser.branch?.id) {
        setBranchId(parsedUser.branch.id); // Bắt buộc lấy branchId từ user.branch.id
      }
    }

    // Lấy danh sách chi hội (dùng cho non-ADMIN)
    getBranches()
      .then((data) => setBranches(data))
      .catch((error) => {
        console.error("Error fetching branches:", error);
        setBranches([]);
      });
  }, []);

  // Sample membership data
  const membershipData = {
    branch1: { paid: [50, 60, 70], unpaid: [20, 15, 10], years: ["2023", "2024", "2025"] },
    branch2: { paid: [40, 55, 65], unpaid: [25, 20, 15], years: ["2023", "2024", "2025"] },
  };

  const fetchFeeData = async (branchId: string) => {
    try {
      const response = await getMembershipFeeByBranch(branchId);
      setFeeData(response);
    } catch (error) {
      console.error("Error fetching fee data:", error);
    }
  };

  const fetchEventData = async (branchId: string) => {
    try {
      const response = await getEventReport({branchId});
      setEventData(response);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const fetchSponsorData = async (branchId: string) => {
    try {
      const response = await getSponsorRanking({
        ...filters,
        branchId,
      });
      setSponsorData(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error fetching sponsor data:", error);
      setSponsorData(null);
      setMeta({
        page: 1,
        take: 10,
        itemCount: 0,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    }
  };

  // Fetch data khi branchId hoặc filters thay đổi
  useEffect(() => {
    if (branchId) {
      fetchFeeData(branchId);
      fetchEventData(branchId);
      fetchSponsorData(branchId);
    }
  }, [branchId, filters]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle branch selection từ Select (chỉ cho non-ADMIN)
  const handleBranchChange = (value: string) => {
    if (user?.role !== "ADMIN") {
      setBranchId(value);
    }
  };

  // Loading state
  if (!user || (user.role === "ADMIN" && !branchId)) {
    return <div>Loading...</div>;
  }

  const tabs = [
    {
      id: "membership",
      label: "Hội phí",
      content: (
        <div>
          <div className="font-bold p-4 text-lg">
            <h3>Chi hội: {branches.find((b) => b.id === branchId)?.name || "N/A"}</h3>
          </div>
          <div className="flex gap-5">
            <div className="w-1/2">
              <MembershipChart
                branchData={
                  membershipData[branchId as keyof typeof membershipData] ||
                  membershipData.branch1
                }
              />
            </div>
            <div className="w-1/2">
              <FeeChart feeData={feeData} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "sponsorship",
      label: "Tài trợ",
      content: (
        <div>
          <div className="flex gap-5">
            <div className="w-1/2">
              <SponsorTable
                sponsors={sponsorData}
                meta={meta}
                onPageChange={handlePageChange}
              />
            </div>
            <div className="w-1/2">
              <EventChart eventData={eventData} />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="flex justify-center z-0 w-full">
      <div className="w-full">
        <p className="font-bold text-2xl mb-10">Thống kê Hội phí và Tài trợ</p>
        <div className="">
          {/* Chỉ hiển thị Select nếu không phải ADMIN */}
          {user.role !== "ADMIN" && (
            <Select
              aria-label="select-branch"
              variant="bordered"
              placeholder="Chọn chi hội"
              className="w-full lg:w-40 min-w-[180px]"
              classNames={{ mainWrapper: "bg-white rounded-large" }}
              onChange={(e) => handleBranchChange(e.target.value)}
              value={branchId || ""}
            >
              {branches.map((branch) => (
                <SelectItem key={branch.id} >
                  {branch.name}
                </SelectItem>
              ))}
            </Select>
          )}
          {/* Hiển thị tên chi hội cố định nếu là ADMIN */}
          {user.role === "ADMIN" && branchId && (
            <div className="text-lg font-semibold">
              Chi hội: {branches.find((b) => b.id === branchId)?.name || "N/A"}
            </div>
          )}
        </div>
        <div className="bg-white p-5 border border-gray-300 shadow-lg rounded-lg mt-5 w-full">
          <Tabs aria-label="Dashboard tabs" items={tabs} color="primary">
            {(item) => (
              <Tab key={item.id} title={item.label}>
                <Card>
                  <CardBody>{item.content}</CardBody>
                </Card>
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    </section>
  );
}