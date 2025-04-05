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
import ModalCreateSponsorBenefit from "../benefit/SponsorBenefitForm";
import { deleteSponsorBenefit, getAllSponsorBenefits } from "@/services/sponsor-benefit/sponsorBenefitService";
import { Benefit, MemberTitle, Title } from "@/lib/model/type";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "../ConfirmationModal";

export default function SponsorBenefit() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(null);
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
      const benefitData = await getAllSponsorBenefits();
      setBenefits(benefitData);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      setBenefits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { name: "Tên quyền lợi", uid: "name" },
    { name: "Mô tả", uid: "description" },
    { name: "", uid: "actions" },
  ];

  const handleDeleteClick = (id: string) => {
    setSelectedBenefitId(id);
    setIsDeleteModalOpen(true);
  };

  const columnsConfig = {
    name: (data: any) => <div className="w-32 truncate">{data.title}</div>,
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

  const handleEdit = (benefit: Benefit) => {
    setSelectedBenefitId(benefit.id);
    setSelectedBenefit(benefit);
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
    if (!selectedBenefitId) return;

    try {
      const response = await deleteSponsorBenefit(selectedBenefitId);
      addToast({
        title: "Thành công",
        description: "Xóa quyền lợi thành công!",
        color: "success",
        variant: "bordered",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Xóa quyền lợi thất bại!",
        color: "danger",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedBenefitId(null);
    }
  };

  // Calculate paginated data
  const getPaginatedData = () => {
    const startIndex = (filters.page - 1) * filters.take;
    const endIndex = startIndex + filters.take;
    return benefits.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(benefits.length / filters.take);

  return (
    <div className="w-full bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold text-lg">Quyền lợi nhà tài trợ</div>
        <Button
          endContent={<FaPlus />}
          color="primary"
          onPress={() => {
            setSelectedBenefit(null);
            setIsModalOpen(true);
          }}
        >
          Thêm mới quyền lợi
        </Button>
      </div>

      <TableCustomize
        ariaLabel="Sponsor Benefits List"
        columns={columns}
        columnsConfig={columnsConfig}
        searchBy={"name"}
        data={getPaginatedData()}
        isLoading={isLoading}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page: number) => handleFilterChange("page", page)}
      />

      <ModalCreateSponsorBenefit
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setSelectedData={setSelectedBenefit}
        refreshData={fetchData}
        selectedItem={selectedBenefit}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa quyền lợi"
        message="Bạn có chắc chắn muốn xóa quyền lợi này không? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="danger"
      />
    </div>
  );
}