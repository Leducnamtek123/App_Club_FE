"use client";
import { useState, useEffect } from "react";
import TableCustomize from "@/components/ui/table_customize";
import {
  approvedUser,
  getApprovedUser,
  rejectUser,
  unbanUser,

} from "@/services/membership/membershipServices";
import {
  Button,
  Chip,
  Tooltip,
  addToast,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { FaCheck, FaSearch } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { MdLockOpen } from "react-icons/md"; // Added icon for unban
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

const statusColorMap = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
  banned: "danger",
};

export default function MembershipPage() {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [rejectedMembers, setRejectedMembers] = useState([]);
  const [bannedMembers, setBannedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    take: 10,
    q: "",
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
  const [branches, setBranches] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalAction, setModalAction] = useState("approve");
  const userRole =
  typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;
  const isAdmin = role === "ADMIN";


  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch(() => setBranches([]));
  }, []);

  const fetchData = async (status) => {
    setIsLoading(true);
    try {
      const response = await getApprovedUser({ ...filters, status });
      const data = response.data || [];
      const setterMap = {
        pending: setPendingMembers,
        rejected: setRejectedMembers,
        banned: setBannedMembers,
      };
      setterMap[status](data);
      setMeta({
        page: filters.page,
        take: filters.take,
        itemCount: data.length,
        pageCount: Math.ceil(data.length / filters.take),
        hasPreviousPage: filters.page > 1,
        hasNextPage: filters.page < Math.ceil(data.length / filters.take),
      });
    } catch (error) {
      console.error(`Error fetching ${status} users:`, error);
      const setterMap = {
        pending: setPendingMembers,
        rejected: setRejectedMembers,
        banned: setBannedMembers,
      };
      setterMap[status]([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData("pending");
    fetchData("rejected");
    fetchData("banned");
  }, [filters.page, filters.take, filters.q, filters.branchId]);

  const handleAction = async (data, action) => {
    if (loadingActions[data.id]) return;

    if (action === "approve" || action === "unban") {
      setSelectedUser(data);
      setModalAction(action);
      setIsModalOpen(true);
      return;
    }

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
      fetchData("pending");
      fetchData("rejected");
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
      if (modalAction === "approve") {
        if (selectedUser.status === "approved") {
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
      } else if (modalAction === "unban") {
        await unbanUser(selectedUser.id); // Assuming this API exists
        addToast({
          title: "Thành công",
          description: "Gỡ cấm thành công",
          color: "success",
        });
      }
      fetchData("pending");
      fetchData("rejected");
      fetchData("banned");
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: modalAction === "approve" ? "Xác nhận thất bại" : "Gỡ cấm thất bại",
        color: "danger",
      });
      console.error(`${modalAction === "approve" ? "Duyệt" : "Gỡ cấm"} thất bại:`, error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [selectedUser.id]: false }));
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  const columnsConfig = {
    name: (data) => <div className="truncate"><p>{data.name}</p></div>,
    companyName: (data) => <div className="w-40 truncate"><p>{data.companyName ?? "-"}</p></div>,
    branch: (data) => <div><p>{data.branch?.name ?? "-"}</p></div>,
    status: (data) => (
      <Chip
        variant="shadow"
        className="capitalize"
        color={statusColorMap[data.status]}
        size="sm"
      >
        {data.status}
      </Chip>
    ),
    actions: (data) => (
      <div className="relative flex justify-center items-center gap-3">
        {data.status === "banned" ? (
          <Tooltip content="Gỡ cấm" placement="top">
            <Button
              size="sm"
              color="success"
              variant="light"
              isIconOnly
              isLoading={loadingActions[data.id]}
              onPress={() => handleAction(data, "unban")}
            >
              <MdLockOpen size={20} />
            </Button>
          </Tooltip>
        ) : (
          <>
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
          </>
        )}
      </div>
    ),
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, q: searchInput, page: 1 }));
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">Xét duyệt hội viên</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center h-10 w-full sm:w-auto rounded-lg overflow-hidden border border-gray-300">
            <Input
              placeholder="Tìm kiếm"
              startContent={<FaSearch className="text-gray-500" />}
              value={searchInput}
              radius="none"
              onChange={(e) => setSearchInput(e.target.value)}
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
          {!isAdmin && (
            <Select
            aria-label="branch"
            placeholder="Chọn chi hội"
            variant="bordered"
            className="w-full sm:w-40 bg-white rounded-large"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                branchId: e.target.value,
                page: 1,
              }))
            }
          >
            {branches?.map((branch) => (
              <SelectItem key={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </Select>
          )}
          
        </div>

        <Tabs aria-label="Membership status tabs" variant="bordered" className="w-full" color="primary">
          <Tab key="pending" title="Đang chờ duyệt">
            <TableCustomize
              ariaLabel="Pending members"
              columns={columns}
              data={pendingMembers}
              columnsConfig={columnsConfig}
              isLoading={isLoading}
              page={filters.page}
              totalPages={meta.pageCount}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </Tab>
          <Tab key="rejected" title="Đã từ chối">
            <TableCustomize
              ariaLabel="Rejected members"
              columns={columns}
              data={rejectedMembers}
              columnsConfig={columnsConfig}
              isLoading={isLoading}
              page={filters.page}
              totalPages={meta.pageCount}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </Tab>
          <Tab key="banned" title="Đã cấm">
            <TableCustomize
              ariaLabel="Banned members"
              columns={columns}
              data={bannedMembers}
              columnsConfig={columnsConfig}
              isLoading={isLoading}
              page={filters.page}
              totalPages={meta.pageCount}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </Tab>
        </Tabs>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={modalAction === "approve" ? "Xác nhận xét duyệt" : "Xác nhận gỡ cấm"}
          message={
            modalAction === "approve"
              ? selectedUser?.status === "pending"
                ? "Bạn có muốn xét duyệt thành viên này không?"
                : "Người này đã bị từ chối trước đó, bạn có muốn duyệt lại không?"
              : "Bạn có muốn gỡ cấm thành viên này không?"
          }
          note={
            modalAction === "approve" && selectedUser?.status === "rejected"
              ? "Hành động này sẽ thay đổi trạng thái thành được duyệt."
              : undefined
          }
          confirmText="Xác nhận"
          cancelText="Hủy"
          confirmColor={modalAction === "approve" ? "primary" : "success"}
        />
      </div>
    </section>
  );
}