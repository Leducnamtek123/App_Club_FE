"use client";
import AddSponsorForm from "@/components/ui/event/sponsor/AddSponsorForm";
import TableRank from "@/components/ui/event/sponsor/TableRank";
import TableCustomize from "@/components/ui/table_customize";
import { Event } from "@/lib/model/type";
import {
  getSponsorByEventId,
  getSponsorRankByEvent,
} from "@/services/event/eventSponsorService";
import { getApprovedUser } from "@/services/membership/membershipServices";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";

const columns = [
  { name: "Nhà tài trợ", uid: "sponsor", sortable: true },
  { name: "Công ty", uid: "companyName", sortable: true },
  { name: "Giá tiền", uid: "amount", sortable: true },
  { name: "Ngày ghi nhận", uid: "createDate" },
  { name: "Actions", uid: "actions" },
];

export default function EventSponsor({ onEditButtonRender }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id") || id;
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranch] = useState();
  const [users, setUsers] = useState([]);
  const [sponsorRank, setSponsorRank] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [eventInfo, setEventInfo] = useState<Event>();
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    take: 10,
    eventId: eventId,
  });
  const [filtersUser, setFilterUsers] = useState({
    search: "",
    page: 1,
    take: 50,
  });
  const [meta, setMeta] = useState({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Tạo nút "Thêm nhà tài trợ" với useMemo
  const addSponsorButton = useMemo(
    () => (
      <Button
        endContent={<FaPlus />}
        size="md"
        color="primary"
        onPress={() => setIsModalOpen(true)}
      >
        Thêm nhà tài trợ
      </Button>
    ),
    [] // Không phụ thuộc vào state nào vì nút không thay đổi nội dung
  );

  // Gửi nút ra ngoài khi mount
  useEffect(() => {
    if (onEditButtonRender) {
      onEditButtonRender(addSponsorButton);
    }
  }, [onEditButtonRender, addSponsorButton]);

  const fetchUserData = async () => {
    try {
      const response = await getApprovedUser({
        ...filtersUser,
        status: "approved",
        role: "USER",
      });
      console.log("Users data:", response.data);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setMeta({
        page: 1,
        take: 50,
        itemCount: 0,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    }
  };

  const fetchSponsorRanking = async () => {
    try {
      setIsLoading(true);
      const data = await getSponsorRankByEvent(
        Array.isArray(eventId) ? eventId[0] : eventId
      );
      setSponsorRank(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSponsorData = async () => {
    try {
      setIsLoading(true);
      const response = await getSponsorByEventId({
        ...filters,
        eventId: Array.isArray(filters.eventId)
          ? filters.eventId[0]
          : filters.eventId,
      });
      setEventInfo(response.event);
      setData(response.data);
      setMeta(response.meta);
    } catch (error) {
      setEventInfo(null);
      setData([]);
      setMeta({
        page: 1,
        take: 10,
        itemCount: 0,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorRanking();
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [filtersUser.search]);

  useEffect(() => {
    fetchSponsorData();
  }, [filters.page, filters.search]);

  const openAddSponsor = (data: any) => {
    if (data && typeof data !== "string") {
      setSelectedSponsor({
        sponsorId: data.sponsor.id,
        amount: data.amount,
        note: data.note,
        logo: data.logo,
        id: data.id, // Thêm id để dùng trong cập nhật
      });
    } else {
      setSelectedSponsor(null); // Reset khi mở ở chế độ thêm mới
    }
    setIsModalOpen(true);
  };
  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedSponsor(null); // Reset selectedSponsor khi đóng modal
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleSponsorAdded = () => {
    fetchSponsorData();
    fetchSponsorRanking();
    setSelectedSponsor(null);
  };

  const columnsConfig = {
    sponsor: (data: any) => (
      <div className="flex items-center gap-2">
        <Avatar
          className="w-12 h-12"
          src={data?.logo}
          alt={data.sponsor.name}
          size="sm"
        />
        <span>{data.sponsor.name}</span>
      </div>
    ),
    companyName: (data: any) => <div>{data.sponsor.companyName || "N/A"}</div>,
    amount: (data: any) => (
      <div>{parseFloat(data.amount).toLocaleString("vi-VN")} VNĐ</div>
    ),
    createDate: (data: any) => (
      <div>{new Date(data.createdAt).toLocaleDateString("vi-VN")}</div>
    ),
    actions: (data: any) => (
      <div className="flex justify-center items-center">
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <BiDotsVerticalRounded size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Actions">
            <DropdownItem key="update" onPress={() => openAddSponsor(data)}>
              Cập nhật
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full flex gap-5">
        <div className="w-3/5">
          <TableCustomize
            ariaLabel="Sponsor List"
            columns={columns}
            data={data}
            columnsConfig={columnsConfig}
            emptyContent="Chưa có nhà tài trợ"
            isLoading={isLoading}
            page={filters.page}
            totalPages={meta?.pageCount}
            onPageChange={(page: number) => handleFilterChange("page", page)}
          />
          <AddSponsorForm
            isModalOpen={isModalOpen}
            setIsModalOpen={handleModalClose} // Sử dụng handleModalClose thay vì setIsModalOpen trực tiếp
            eventInfo={eventInfo}
            branchData={branch}
            usersData={users}
            onSponsorAdded={handleSponsorAdded}
            sponsorData={selectedSponsor}
          />
        </div>
        <div className="w-2/5">
          <TableRank data={sponsorRank} />
        </div>
      </div>
    </section>
  );
}
