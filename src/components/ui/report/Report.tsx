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
import MembershipAllFeeChart from "../chart/MembershipAllFeeChart";

export default function Report() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [year, setYear] = useState("2025");
  const [feeData, setFeeData] = useState();
  const [eventData, setEventData] = useState();
  const [sponsorData, setSponsorData] = useState(null);
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

  // Fetch danh sách chi hội
  useEffect(() => {
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

  const fetchFeeData = async (branchId?: string) => {
    try {
      const response = await getMembershipFeeByBranch(branchId);
      setFeeData(response);
    } catch (error) {
      console.error("Error fetching fee data:", error);
    }
  };

  const fetchEventData = async (branchId?: string) => {
    try {
      const response = await getEventReport({ branchId });
      setEventData(response);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const fetchSponsorData = async (branchId?: string) => {
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

  // Fetch data ban đầu và khi branchId hoặc filters thay đổi
  useEffect(() => {
    fetchFeeData(branchId || undefined);
    fetchEventData(branchId || undefined);
    fetchSponsorData(branchId || undefined);
  }, [branchId, filters]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle branch selection từ Select
  const handleBranchChange = (value: string) => {
    setBranchId(value || null); // Nếu value rỗng thì set về null
  };

  const tabs = [
    {
      id: "membership",
      label: "Hội phí",
      content: (
        <div>
          <div className="font-bold p-4 text-lg">
            <h3>
              Chi hội: {branchId ? branches.find((b) => b.id === branchId)?.name : "Tất cả"}
            </h3>
          </div>
          <div className="flex gap-5">
            <div className="w-1/2">
              {/* <MembershipChart
                branchData={
                  membershipData[branchId as keyof typeof membershipData] ||
                  membershipData.branch1
                }
              /> */}
              <MembershipAllFeeChart />
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
              <SelectItem key={branch.id}>{branch.name}</SelectItem>
            ))}
          </Select>
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