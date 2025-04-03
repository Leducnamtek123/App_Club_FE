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
    take: 10,
  });

  const [meta, setMeta] = useState({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Fetch data function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const titleData = await getTitle();
      setTitles(titleData);
      setMeta({
        page: 1,
        take: 10,
        itemCount: titleData.length,
        pageCount: Math.ceil(titleData.length / 10),
        hasPreviousPage: false,
        hasNextPage: titleData.length > 10,
      });
    } catch (error) {
      console.error("Error fetching titles:", error);
      setTitles([]);
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
  }, []);

  const columns = [
    { name: "Danh hiệu", uid: "name" },
    { name: "Mô tả", uid: "description" },
    { name: "", uid: "actions" },
  ];

  
  const handleDeleteClick= (id: string) => {
    setSelectedTitleId(id);
    setIsDeleteModalOpen(true);
  };



  const columnsConfig = {
    name: (data: any) => <div className="w-32">{data.name}</div>,
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
    setSelectedTitle(title); // Lưu danh hiệu được chọn
    setIsModalOpen(true); // Mở modal
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

  return (
    <div className="w-full bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold text-lg">Danh sách các danh hiệu</div>
        <Button
          endContent={<FaPlus />}
          color="primary"
          onPress={() => {
            setSelectedTitle(null); // Reset khi tạo mới
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
        data={titles}
        isLoading={isLoading}
        page={filters.page}
        totalPages={meta.pageCount}
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