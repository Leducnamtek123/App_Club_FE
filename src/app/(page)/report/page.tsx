"use client";

import EventChart from "@/components/ui/chart/EventChart";
import FeeChart from "@/components/ui/chart/FeeChart";
import MembershipChart from "@/components/ui/chart/MembershipChart";
import SponsorTable from "@/components/ui/chart/SponsorTable";
import { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody, Select, SelectItem } from "@heroui/react";
import {
  getEventReportBranch,
  getMembershipFeeByBranch,
  getSponsorRanking,
} from "@/services/report/reportServices";
import { User } from "@/lib/model/type";

export default function Page() {
  const [branch, setBranch] = useState("branch1");
  const [year, setYear] = useState("2025");
  const [feeData, setFeeData] = useState();
  const [eventData, setEventData] = useState();
  const [user, setUser] = useState<User | null>(null);
  const [sponsorData, setSponsorData] = useState(null);
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

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Sample membership data
  const membershipData = {
    branch1: {
      paid: [50, 60, 70],
      unpaid: [20, 15, 10],
      years: ["2023", "2024", "2025"],
    },
    branch2: {
      paid: [40, 55, 65],
      unpaid: [25, 20, 15],
      years: ["2023", "2024", "2025"],
    },
  };

  const fetchFeeData = async (branchId) => {
    try {
      const response = await getMembershipFeeByBranch(branchId);
      setFeeData(response);
    } catch (error) {
      console.error("Error fetching fee data:", error);
    }
  };

  const fetchEventData = async (branchId) => {
    try {
      const response = await getEventReportBranch(branchId);
      setEventData(response);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const fetchSponsorData = async () => {
    try {
      const response = await getSponsorRanking({
        ...filters,
        branchId: user?.branch.id,
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

  // Fetch data when user or filters change
  useEffect(() => {
    if (user?.branch.id) {
      fetchFeeData(user.branch.id);
      fetchEventData(user.branch.id);
      fetchSponsorData();
    }
  }, [user, filters]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Loading state
  if (!user) {
    return <div>Loading...</div>;
  }

  const tabs = [
    {
      id: "membership",
      label: "Hội phí",
      content: (
        <div>
          <div className="font-bold p-4 text-lg">
            <h3>Chi hội: {user?.branch.name}</h3>
          </div>
          <div className="flex gap-5">
            <div className="w-1/2">
              <MembershipChart branchData={membershipData[branch]} />
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
          {/* <Select
            label="Chọn năm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="max-w-xs mb-4"
            defaultSelectedKeys={[year]}
          >
            <SelectItem key="2023">2023</SelectItem>
            <SelectItem key="2024">2024</SelectItem>
            <SelectItem key="2025">2025</SelectItem>
          </Select> */}
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thống kê Hội phí và Tài trợ</h1>
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
  );
}