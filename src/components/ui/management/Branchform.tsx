"use client";

import ModalCreateBranch from "@/components/ui/branch/createFormModal";
import TableCustomize from "@/components/ui/table_customize";
import { deleteBranch, getBranches } from "@/services/branch/branchServices";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { Branch } from "@/lib/model/type";
import { FaEdit, FaEllipsisV, FaPlus } from "react-icons/fa";
import { ConfirmationModal } from "../ConfirmationModal";

export const columns = [
  { name: "Tên chi hội", uid: "name" },
  { name: "Thông tin chi tiết", uid: "description" },
  { name: "Chi hội trưởng", uid: "leader" },
  { name: "", uid: "actions" },
] as never;
export const searchBy = ["name"] as never;

export default function BranchForm() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null); // Branch được chọn để chỉnh sửa

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const branches = await getBranches();
      console.log("This is Branches:: ", branches);
      if (branches) {
        setBranches(branches);
      } else {
        console.log("Error fetching branches");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch); // Lưu branch cần chỉnh sửa
    setIsModalOpen(true); // Mở modal chỉnh sửa
  };

  const handleDeleteClick= (id: string) => {
    setSelectedBranchId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBranchId) return;

    try {
      const response = await deleteBranch(selectedBranchId);
      addToast({
        title: "Thành công",
        description: "Xóa chi hội thành công!",
        color: "success",
        variant: "bordered",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Xóa chi hội thất bại!",
        color: "danger",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBranchId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columnsConfig = {
    branchName: (data: Branch) => (
      <div className="w-32 truncate">
        <p>{data.name}</p>
      </div>
    ),
    branchDescription: (data: Branch) => (
      <div className="w-40 truncate">
        <p>{data.description}</p>
      </div>
    ),
    leader: (data: Branch) => (
      <div className="w-40 truncate">
        <p>{data.leader?.name || "Chưa có"}</p>
      </div>
    ),
    actions: (data: Branch) => (
      <div className="relative flex justify-center items-center h-9">
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light" color="primary">
              <FaEllipsisV />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="edit"
              startContent={<FaEdit />}
              onPress={() => handleEdit(data)}
            >
              Cập nhật chi hội trưởng
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<BiTrash />}
              color="danger"
              onPress={() => handleDeleteClick(data.id)}
            >
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
  };

  return (
    <div className="w-2/4 bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold">Thông tin chi hội</div>
        <Button
          endContent={<FaPlus />}
          color="primary"
          onPress={() => {
            setSelectedBranch(null); // Reset khi tạo mới
            setIsModalOpen(true);
          }}
        >
          Thêm mới chi hội
        </Button>
      </div>

      <TableCustomize
        ariaLabel="Branch table"
        columns={columns}
        searchBy={searchBy}
        data={branches}
        columnsConfig={columnsConfig}
        isLoading={isLoading}
        page={0}
        totalPages={0}
        onPageChange={function (page: number): void {
          throw new Error("Function not implemented.");
        }}
      />

      <ModalCreateBranch
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setSelectedData={setBranches}
        refreshData={fetchData}
        selectedBranch={selectedBranch} // Truyền branch được chọn để chỉnh sửa
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa chi hội"
        message="Bạn có chắc chắn muốn xóa chi hội này không? Hành động này không thể hoàn tác."
        note="Chi hội sau khi xóa sẽ không thể khôi phục."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="danger"
      />
    </div>
  );
}