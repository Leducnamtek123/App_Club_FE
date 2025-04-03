"use client";

import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaEye, FaSearch } from "react-icons/fa";
import { LuMail } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { BsFiletypePdf } from "react-icons/bs";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  Tooltip,
  User,
} from "@heroui/react";
import { getBranches } from "@/services/branch/branchServices";
import {
  deleteUser,
  downloadPDF,
  exportMembersToPDF,
  getApprovedUser,
  lockAccount,
} from "@/services/membership/membershipServices";
import MemberShipDetailForm from "@/components/ui/membership/DetailForm";
import FeeForm from "@/components/ui/membership/FeeForm";
import SendNotificationForm from "@/components/ui/membership/FeeReminderNotif";
import TableCustomize from "@/components/ui/table_customize";
import TitleCreateForm from "@/components/ui/title/createTitle";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import TitleAdded from "@/components/ui/title/addTitleToUser";
import { getTitle } from "@/services/title/titleServices";
import SendAllNotificationForm from "@/components/ui/membership/approval/SendAllNotif";

const columns = [
  { name: "Họ và tên", uid: "name", sortable: true },
  { name: "Công ty", uid: "companyName" },
  { name: "Email", uid: "email" },
  { name: "Số điện thoại", uid: "phone" },
  { name: "Chi hội/nhóm ngành", uid: "branch" },
  { name: "Ngày tham gia", uid: "createAt", sortable: true },
  { name: "Đóng hội phí", uid: "groupFee" },
  { name: "", uid: "actions" },
];

const searchBy = ["name", "companyName", "email", "phone"];

export default function Page() {
  const [modalState, setModalState] = useState({
    detail: false,
    notification: false, // Sử dụng để mở form gửi thông báo
    fee: false,
    title: false,
    confirm: false,
    lock:false
  });
  const [selectedData, setSelectedData] = useState(null);
  const [members, setMembers] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [titleData, setTitleData] = useState();
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
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set([]));
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    getBranches()
      .then(setBranchs)
      .catch(() => setBranchs([]));
    fetchTitle();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.q, filters.branchId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getApprovedUser({
        ...filters,
        status: "approved",
        role: "USER",
      });
      setMembers(response.data);
      setMeta(response.meta);
    } catch {
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

  const fetchTitle = async () => {
    try {
      const response = await getTitle();
      setTitleData(response);
    } catch (error) {
      throw error;
    }
  };

  const openModal = (type: string, data = null) => {
    setSelectedData(data);
    setModalState((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = () => {
    setSelectedData(null);
    setModalState({
      detail: false,
      notification: false,
      fee: false,
      title: false,
      confirm: false,
      lock:false
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleSelectionChange = (selectedIds: string[], selectedItems: any[]) => {
    const isAll = selectedIds.length === members.length;
    setIsAllSelected(isAll);
    setSelectedRowIds(isAll ? new Set([]) : new Set(selectedIds));
    setSelectedItems(selectedItems);
    console.log("Selected Items:", selectedItems);
  };

  const handleDelete = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await deleteUser(data.id);
      addToast({
        title: "Thành công",
        description: "Xóa hội viên thành công.",
        variant: "bordered",
        color: "success",
      });
      fetchData();
      closeModal();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Xóa hội viên thất bại.",
        variant: "solid",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columnsConfig = {
    name: (data: any) => (
      <div className="block">
        <p>{data.name}</p>
        <p className="text-sm text-gray-500">{data.position}</p>
      </div>
    ),
    companyName: (data: any) => (
      <p className="truncate w-40">{data.companyName}</p>
    ),
    branch: (data: any) => <p>{data.branch?.name}</p>,
    address: (data: any) => <p className="truncate w-40">{data.address}</p>,
    createAt: (data: any) => (
      <p>{new Date(data.createdAt).toLocaleDateString("vi-VN")}</p>
    ),
    groupFee: (data: any) => (
      <Button
        size="sm"
        variant="light"
        color="primary"
        onPress={() => openModal("fee", data)}
      >
        Đóng phí
      </Button>
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
            <DropdownItem key="edit" onPress={() => openModal("detail", data)}>
              Chỉnh sửa
            </DropdownItem>
            <DropdownItem key="assign" onPress={() => openModal("title", data)}>
              Gán danh hiệu
            </DropdownItem>
            <DropdownItem
              key="lock"
              className="text-red-500"
              onPress={() => openModal("lock", data)}
            >
              Khóa tài khoản
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-red-500"
              onPress={() => openModal("confirm", data)}
            >
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  };

  const hasSelectedRows = isAllSelected || selectedRowIds.size > 0;

  const handleSendNotification = () => {
    openModal("notification");
  };

  const handleLockAccount =  async (data:any) => {
    try {
      await lockAccount(data.id);
      addToast({
        title: "Thành công",
        description: `Đã khóa tài khoản của ${data.name}`,
        variant: "bordered",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Thất bại",
        description: `Khóa tài khoản thất bại`,
        variant: "solid",
        color: "danger",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      const response = await exportMembersToPDF({
        branchId: filters.branchId,
        status: "approved",
      });

      if (response) {
        const downloadURL = response.downloadUrl.split("/downloads/")[1];
        const responseBlob = await downloadPDF(downloadURL);
        const blob = new Blob(responseBlob.data);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "danh_sach_hoi_vien.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        addToast({
          title: "Thành công",
          description: "Xuất file PDF danh sách hội viên thành công.",
          variant: "bordered",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Lỗi trong handleExportPDF:", error);
      let errorMessage = "Xuất file PDF thất bại";
      if (error.message.includes("404")) {
        errorMessage = "File PDF chưa sẵn sàng hoặc không tồn tại";
      } else {
        errorMessage += ": " + error.message;
      }
      addToast({
        title: "Lỗi",
        description: errorMessage,
        variant: "solid",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberUpdated = () => {
    fetchData();
  };
  const handleTitleAdded = () => {
    fetchData();
  };

  const [searchInput, setSearchInput] = useState("");

  const handleInputChange = (value) => {
    setSearchInput(value);
    if (value === "") {
      handleFilterChange("q", "");
    }
  };

  const handleSearch = () => {
    handleFilterChange("q", searchInput);
  };

  return (
    <section className="flex justify-center z-0 w-full">
      <div className="w-full">
        <p className="font-bold text-2xl mb-10">Danh sách hội viên</p>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full">
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
            <Select
              aria-label="select"
              variant="bordered"
              placeholder="Chọn chi hội"
              className="w-full lg:w-40 min-w-[180px]"
              classNames={{ mainWrapper: "bg-white rounded-large" }}
              onChange={(e) => handleFilterChange("branchId", e.target.value)}
            >
              {branchs?.map((branch: any) => (
                <SelectItem key={branch.id}>{branch.name}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex justify-center lg:justify-end gap-3 w-full lg:w-auto">
            <Button
              variant={hasSelectedRows ? "solid" : "bordered"}
              color={hasSelectedRows ? "primary" : "default"}
              onPress={handleSendNotification}
              className="w-full lg:w-auto"
            >
              Gửi thông báo
            </Button>
            <Button
              variant="bordered"
              color="default"
              onPress={handleExportPDF}
              startContent={<BsFiletypePdf />}
              className="w-full lg:w-auto"
              isLoading={isLoading}
            >
              Xuất PDF
            </Button>
          </div>
        </div>
        <TableCustomize
          ariaLabel="Member List"
          columns={columns}
          data={members}
          columnsConfig={columnsConfig}
          isLoading={isLoading}
          page={filters.page}
          totalPages={meta?.pageCount}
          onPageChange={(page: number) => handleFilterChange("page", page)}
          enableSelection={true}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <MemberShipDetailForm
        isModalOpen={modalState.detail}
        setIsModalOpen={closeModal}
        setSelectedData={setSelectedData}
        selectedData={selectedData}
        branchData={branchs}
        onMemberUpdated={handleMemberUpdated}
      />
      <TitleAdded
        isModalOpen={modalState.title}
        setIsModalOpen={closeModal}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        onTitleAdded={handleTitleAdded}
        titleData={titleData}
      />
      <FeeForm
        isModalOpen={modalState.fee}
        setIsModalOpen={closeModal}
        selectedData={selectedData}
      />
      <SendAllNotificationForm
        isModalOpen={modalState.notification}
        setIsModalOpen={closeModal}
        memberData = {members}
        branchData = {branchs}
        selectedMembers={selectedItems} // Truyền danh sách hội viên đã chọn
       
      />
      <ConfirmationModal
        title="Xóa hội viên"
        message="Bạn có chắc chắn muốn xóa hội viên này không?"
        note="Hành động này không thể hoàn tác."
        confirmColor="danger"
        isOpen={modalState.confirm}
        onClose={closeModal}
        onConfirm={() => handleDelete(selectedData)}
      />
      <ConfirmationModal
        title="Khóa tài khoản hội viên"
        message="Bạn có chắc chắn muốn khóa tài khoản hội viên này không?"
        note="Hành động này sẽ khiến hội viên không thể truy cập vào ứng dụng."
        confirmColor="danger"
        isOpen={modalState.lock}
        onClose={closeModal}
        onConfirm={() => handleLockAccount(selectedData)}
      />
    </section>
  );
}