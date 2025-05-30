"use client";

import TableCustomize from "@/components/ui/table_customize";
import { useSearchParams } from "next/navigation";
import { FaEdit, FaEllipsisV, FaPlus, FaTrash } from "react-icons/fa";
import {
  addToast,
  Button,
  darkLayout,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import ModalCreateTitle from "@/components/ui/title/createTitle";
import { deleteTitle, getTitle } from "@/services/title/titleServices";
import { MemberTitle, Title } from "@/lib/model/type";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "../ConfirmationModal";

export default function TitleManagement() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [selectedTitleId, setSelectedTitleId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    take: 5, // Items per page
  });

  // Fetch data function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const titleData = await getTitle();
      setTitles(titleData);
    } catch (error) {
      console.error("Error fetching titles:", error);
      setTitles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "Danh hiệu", uid: "name" },
    { name: "Mô tả", uid: "description" },
    { name: "", uid: "actions" },
  ];

  const handleDeleteClick = (id: string) => {
    setSelectedTitleId(id);
    setIsDeleteModalOpen(true);
  };

  const columnsConfig = {
    name: (data: any) => <div className="w-40 truncate">{data.name}</div>,
    description: (data: any) => (
      <div className="w-32 truncate">{data.description}</div>
    ),
    actions: (data: any) => (
      <div className="">
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
              Chỉnh sửa
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<FaTrash />}
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

  const handleEdit = (title: Title) => {
    setSelectedTitle(title);
    setIsModalOpen(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTitleId) return;

    try {
      const response = await deleteTitle(selectedTitleId);
      addToast({
        title: "Thành công",
        description: "Xóa danh hiệu thành công!",
        color: "success",
        variant: "bordered",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Xóa danh hiệu thất bại!",
        color: "danger",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTitleId(null);
    }
  };

  // Calculate paginated data
  const getPaginatedData = () => {
    const startIndex = (filters.page - 1) * filters.take;
    const endIndex = startIndex + filters.take;
    return titles.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(titles.length / filters.take);

  return (
    <div className="w-full bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold text-lg">Danh hiệu</div>
        <Button
          endContent={<FaPlus />}
          color="primary"
          onPress={() => {
            setSelectedTitle(null);
            setIsModalOpen(true);
          }}
        >
          Thêm mới danh hiệu
        </Button>
      </div>

      <TableCustomize
        ariaLabel="Member Title List"
        columns={columns}
        columnsConfig={columnsConfig}
        searchBy={"name"}
        data={getPaginatedData()} // Use paginated data
        isLoading={isLoading}
        page={filters.page}
        totalPages={totalPages} // Use calculated total pages
        onPageChange={(page: number) => handleFilterChange("page", page)}
      />

      <ModalCreateTitle
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setSelectedData={setSelectedTitle}
        refreshData={fetchData}
        selectedItem={selectedTitle}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa danh hiệu"
        message="Bạn có chắc chắn muốn xóa này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="danger"
      />
    </div>
  );
}