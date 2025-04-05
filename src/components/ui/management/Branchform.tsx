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
  Pagination,
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
];
export const searchBy = ["name"];

export default function BranchForm() {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
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

  // Calculate pagination data
  const totalItems = branches.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedBranches = branches.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const columnsConfig = {
    name: (data) => (
      <div className="w-32 truncate">
        <p>{data.name}</p>
      </div>
    ),
    description: (data) => (
      <div className="w-40 truncate">
        <p>{data.description}</p>
      </div>
    ),
    leader: (data) => (
      <div className="w-40 truncate">
        <p>{data.leader?.name || "Chưa có"}</p>
      </div>
    ),
    actions: (data) => (
      <div className="relative flex justify-center items-center ">
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
    <div className="bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold">Thông tin chi hội</div>
        <Button
          endContent={<FaPlus />}
          color="primary"
          onPress={() => {
            setSelectedBranch(null);
            setIsModalOpen(true);
          }}
        >
          Thêm mới chi hội
        </Button>
      </div>

      <TableCustomize
        ariaLabel="Branch table"
        columns={columns}
        //searchBy={searchBy}
        data={paginatedBranches}
        columnsConfig={columnsConfig}
        isLoading={isLoading}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <ModalCreateBranch
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setSelectedData={setBranches}
        refreshData={fetchData}
        selectedBranch={selectedBranch}
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