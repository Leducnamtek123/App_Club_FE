"use client";
import TableCustomize from "@/components/ui/table_customize";
import {
  approvedUser,
  getApprovedUser,
  getPendingUser,
  rejectUser,
} from "@/services/membership/membershipServices";
import {
  Button,
  Chip,
  Tooltip,
  addToast,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { FaCheck, FaSearch } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { Branch } from "@/lib/model/type";
import { getBranches } from "@/services/branch/branchServices";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";


export const columns = [
  { name: "Họ và tên", uid: "name", sortable: true },
  { name: "Công ty", uid: "companyName" },
  { name: "Email", uid: "email" },
  { name: "Số điện thoại", uid: "phone" },
  { name: "Chi hội/nhóm ngành", uid: "branch" },
  { name: "Trạng thái", uid: "status", sortable: true },
  { name: "", uid: "actions" },
];

export const searchBy = ["name", "companyName", "email", "phone", "branch"];

const statusColorMap = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

export default function Page() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [branchs, setBranchs] = useState<Branch[]>([]);
  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    take: 10,
    order: undefined,
    branchId: undefined,
  });
  const [meta, setMeta] = useState({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // State cho ConfirmationModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");

  useEffect(() => {
    getBranches()
      .then(setBranchs)
      .catch(() => setBranchs([]));
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pendingUsers = await getApprovedUser({ ...filters, status: "pending" });
      const rejectedUsers = await getApprovedUser({ ...filters, status: "rejected" });
      const bannedUsers = await getApprovedUser({ ...filters, status: "banned" });
      const combinedUsers = [...(pendingUsers.data || []), ...(rejectedUsers.data || []),...(bannedUsers.data || [])];
      setMembers(combinedUsers);
      setMeta({
        page: filters.page,
        take: filters.take,
        itemCount: combinedUsers.length,
        pageCount: Math.ceil(combinedUsers.length / filters.take),
        hasPreviousPage: filters.page > 1,
        hasNextPage: filters.page < Math.ceil(combinedUsers.length / filters.take),
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setMembers([]);
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

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.take, filters.q, filters.order, filters.branchId]);

  const handleBranchChange = (newBranchId: string | undefined) => {
    setBranchId(newBranchId);
    setPage(1);
  };

  const handleAction = async (data: any, action: "approve" | "reject") => {
    if (loadingActions[data.id]) return;

    // Nếu là "approve", hiển thị modal xác nhận
    if (action === "approve") {
      setSelectedUser(data);
      setModalAction(action);
      setIsModalOpen(true);
      return;
    }

    // Xử lý "reject" trực tiếp mà không cần modal
    setLoadingActions((prev) => ({ ...prev, [data.id]: true }));
    try {
      if (action === "reject" && data.status === "rejected") {
        addToast({
          title: "Lỗi",
          description: "Thành viên đã bị từ chối trước đó",
          color: "danger",
        });
        return;
      }

      await rejectUser(data.id);
      addToast({
        title: "Thành công",
        description: "Từ chối thành công",
        color: "success",
      });
      await fetchData();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Từ chối thất bại",
        color: "danger",
      });
      console.error("Từ chối thất bại:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [data.id]: false }));
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    setLoadingActions((prev) => ({ ...prev, [selectedUser.id]: true }));
    try {
      if (modalAction === "approve" && selectedUser.status === "approved") {
        addToast({
          title: "Lỗi",
          description: "Thành viên đã được duyệt trước đó",
          color: "danger",
        });
        return;
      }

      await approvedUser(selectedUser.id);
      addToast({
        title: "Thành công",
        description: "Xác nhận thành công",
        color: "success",
      });
      await fetchData();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Xác nhận thất bại",
        color: "danger",
      });
      console.error("Duyệt thất bại:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [selectedUser.id]: false }));
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const columnsConfig = {
    name: (data: any) => <div className="truncate"><p>{data.name}</p></div>,
    companyName: (data: any) => <div className="w-40 truncate"><p>{data.companyName ?? "-"}</p></div>,
    branch: (data: any) => <div><p>{data.branch?.name ?? "-"}</p></div>,
    status: (data: any) => (
      <Chip
        variant="shadow"
        className="capitalize"
        color={statusColorMap[data.status] as any}
        size="sm"
      >
        {data.status}
      </Chip>
    ),
    actions: (data: any) => (
      <div className="relative flex justify-center items-center gap-3">
        <Tooltip content="Từ chối" placement="top">
          <Button
            size="sm"
            color="danger"
            variant="light"
            isIconOnly
            isLoading={loadingActions[data.id]}
            onPress={() => handleAction(data, "reject")}
          >
            <FaXmark size={20} />
          </Button>
        </Tooltip>
        <Tooltip content="Đồng ý" placement="top">
          <Button
            size="sm"
            color="primary"
            variant="light"
            isIconOnly
            isLoading={loadingActions[data.id]}
            onPress={() => handleAction(data, "approve")}
          >
            <FaCheck size={20} />
          </Button>
        </Tooltip>
      </div>
    ),
  };

  const [searchInput, setSearchInput] = useState("");

  const handleInputChange = (value) => {
    setSearchInput(value);
    if (value === "") handleFilterChange("q", "");
  };

  const handleSearch = () => {
    handleFilterChange("q", searchInput);
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">Xét duyệt hội viên</p>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center h-10 w-full lg:w-auto rounded-lg overflow-hidden border border-gray-300">
            <Input
              placeholder="Tìm kiếm"
              startContent={<FaSearch className="text-gray-500" />}
              value={searchInput}
              radius="none"
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-white border-none focus:ring-0"
              classNames={{ inputWrapper: "bg-white" }}
            />
            <Button
              color="primary"
              onPress={handleSearch}
              className="bg-primary text-white rounded-none px-4"
              isIconOnly
            >
              <FaSearch />
            </Button>
          </div>
          <div className="items-end justify-center">
            <Select
              placeholder="Chọn chi hội"
              variant="bordered"
              className="w-40 bg-white rounded-large"
              onChange={(e) => handleBranchChange(e.target.value)}
            >
              {branchs?.map((branch) => (
                <SelectItem key={branch.id}>{branch.name}</SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <TableCustomize
          ariaLabel="Member pending"
          columns={columns}
          data={members}
          columnsConfig={columnsConfig}
          isLoading={isLoading}
          page={filters.page}
          totalPages={meta.pageCount}
          onPageChange={(page: number) => handleFilterChange("page", page)}
        />

        {/* Tích hợp ConfirmationModal */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAction}
          title="Xác nhận xét duyệt"
          message={
            selectedUser?.status === "pending"
              ? "Bạn có muốn xét duyệt thành viên này không?"
              : "Người này đã bị từ chối trước đó, bạn có muốn duyệt lại không?"
          }
          note={selectedUser?.status === "rejected" ? "Hành động này sẽ thay đổi trạng thái thành được duyệt." : undefined}
          confirmText="Xác nhận"
          cancelText="Hủy"
          confirmColor="primary"
        />
      </div>
    </section>
  );
}