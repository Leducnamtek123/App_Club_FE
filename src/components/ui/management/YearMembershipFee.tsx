"use client";

import TableCustomize from "@/components/ui/table_customize";
import { FaEdit, FaEllipsisV, FaPlus, FaTrash } from "react-icons/fa";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import ModalCreateMembershipFee from "@/components/ui/membership_fee/createMembershipFee";
import { getMembershipFee, deleteMembershipFee } from "@/services/membership_fee/membershipFeeServices";
import { MembershipFee } from "@/lib/model/type";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "../ConfirmationModal";

export const columns = [
  { name: "Năm", uid: "year", sortable: true },
  { name: "Lệ Phí", uid: "amount" },
  { name: "", uid: "actions" }
] as never;
export const searchBy = ["year"] as never;

export default function YearMembershipFee() {
  const [membershipFees, setMembershipFees] = useState<MembershipFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<MembershipFee | null>(null);
  const [feeToDelete, setFeeToDelete] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    take: 5,
  });

  const getPaginatedData = () => {
    const startIndex = (filters.page - 1) * filters.take;
    const endIndex = startIndex + filters.take;
    return membershipFees.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(membershipFees.length / filters.take);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const membershipFees = await getMembershipFee();
      if (membershipFees) {
        // Sắp xếp theo năm tăng dần
        const sortedFees = [...membershipFees].sort((a, b) => a.year - b.year);
        setMembershipFees(sortedFees);
      }
    } catch (error) {
      console.error("Error fetching membership fees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (fee: MembershipFee) => {
    setSelectedFee(fee);
    setIsModalOpen(true);
  };

  const handleDelete = async (year: number) => {
    setFeeToDelete(year);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (feeToDelete !== null) {
      try {
        setIsLoading(true);
        await deleteMembershipFee(feeToDelete);
        await fetchData();
        addToast({
          title: "Thành công",
          description: "Xóa hội phí thành công.",
          variant: "bordered",
          color: "success",
          classNames: { base: "z-3" },
        });
      } catch (error) {
        addToast({
          title: "Thất bại",
          description: "Xóa hội phí thất bại",
          variant: "solid",
          color: "danger",
          classNames: { base: "z-3" },
        });
      } finally {
        setIsLoading(false);
        setFeeToDelete(null);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumberDisplay = (value: number | string) => {
    if (!value) return "0";
    const num = parseFloat(value as string);
    return num % 1 === 0 ? num.toLocaleString("vi-VN") : num.toFixed(2);
  };

  const columnsConfig = {
    year: (data: MembershipFee) => (
      <div className="w-32 truncate">
        <p>{data.year}</p>
      </div>
    ),
    fee: (data: MembershipFee) => (
      <div className="w-32 truncate">
        <p>{formatNumberDisplay(data.amount)}</p>
      </div>
    ),
    actions: (data: MembershipFee) => (
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
              onPress={() => handleDelete(data.year)}
            >
              Xóa
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  return (
    <div className="w-full bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="flex items-center justify-between w-full">
        <div className="font-bold">Hội phí từng năm</div>

        <div className="flex justify-end">
          <Button
            endContent={<FaPlus />}
            color="primary"
            onPress={() => {
              setSelectedFee(null);
              setIsModalOpen(true);
            }}
          >
            Thêm mới hội phí
          </Button>
        </div>
      </div>

      <TableCustomize
        ariaLabel="Membership Fee List"
        columns={columns}
        columnsConfig={columnsConfig}
        searchBy={searchBy}
        data={getPaginatedData()}
        isLoading={isLoading}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page: number) => handleFilterChange("page", page)}
      />

      <ModalCreateMembershipFee
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setSelectedData={setMembershipFees}
        refreshData={fetchData}
        selectedFee={selectedFee}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa hội phí"
        message={`Bạn có chắc chắn muốn xóa hội phí năm ${feeToDelete}?`}
        note="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="danger"
      />
    </div>
  );
}