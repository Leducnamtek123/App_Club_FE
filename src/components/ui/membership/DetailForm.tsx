"use client";

import { updateUser } from "@/services/membership/membershipServices";
import {
  addToast,
  Button,
  DateInput,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useState } from "react";

export const groups = [
  { key: "Premium Members", label: "Premium Members" },
  { key: "Standard Members", label: "Standard Members" },
  { key: "VIP Members", label: "VIP Members" },
];

export const title = [
  { key: "Gold Member", label: "Gold Member" },
  { key: "Silver Member", label: "Silver Member" },
  { key: "Platinum Member", label: "Platinum Member" },
  { key: "Bronze Member", label: "Bronze Member" },
  { key: "Diamond Member", label: "Diamond Member" },
];

export const status = [
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

// Hàm chuyển đổi ISO date thành định dạng YYYY-MM-DD
const formatDateForInput = (isoDate: string | undefined) => {
  if (!isoDate) return null;
  return isoDate.split("T")[0]; // Lấy phần YYYY-MM-DD
};

export default function MemberShipDetailForm({
  isModalOpen,
  setIsModalOpen,
  selectedData,
  setSelectedData,
  branchData,
  onMemberUpdated,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedData(null);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSelectedData((prev: any) => {
      if (!prev) {
        return key === "branchId" 
          ? { branch: { id: value } }
          : { [key]: value };
      }
      if (key === "branchId") {
        console.log("Cập nhật branchId:", value); // Log để kiểm tra
        return {
          ...prev,
          branch: {
            ...prev.branch,
            id: value || "",
          },
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleUpdate = async () => {
    console.log("Dữ liệu trước khi gửi:", selectedData); // Log để kiểm tra
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (selectedData?.name) formData.append("name", selectedData.name);
      if (selectedData?.email) formData.append("email", selectedData.email);
      if (selectedData?.phone) formData.append("phone", selectedData.phone);
      if (selectedData?.companyName) formData.append("companyName", selectedData.companyName);
     // if (selectedData?.address) formData.append("address", selectedData.address);
      if (selectedData?.position) formData.append("position", selectedData.position);
      if (selectedData?.branch?.id) {
        formData.append("branchId", selectedData.branch.id); // Gửi branch_id
        console.log("Branch ID gửi đi:", selectedData.branch.id); // Log để kiểm tra
      } else {
        console.warn("Không có branch_id để gửi!");
      }

      const response = await updateUser(selectedData.id, formData);
      console.log("Response từ server:", response); // Log phản hồi từ server

      if (response) {
        addToast({
          title: "Thành công",
          description: "Cập nhật hội viên thành công.",
          variant: "bordered",
          color: "success",
        });
        handleClose(false);
        onMemberUpdated();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật hội viên:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Cập nhật hội viên thất bại.",
        variant: "bordered",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isModalOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-3xl w-full p-8 rounded-2xl shadow-2xl bg-white">
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          Thông tin hội viên
        </ModalHeader>
        <ModalBody>
          <Form className="grid grid-cols-2 gap-6">
            <Input
              label="Họ và tên"
              value={selectedData?.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={selectedData?.email ?? ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <Input
              label="Số điện thoại"
              value={selectedData?.phone ?? ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input
              label="Công ty"
              value={selectedData?.companyName ?? ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
            <Select
              label="Chi hội"
              selectedKeys={selectedData?.branch?.id ? [selectedData.branch.id] : []}
              onChange={(e) => handleChange("branchId", e.target.value)}
            >
              {branchData?.map((branch: any) => (
                <SelectItem key={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Vị trí"
              value={selectedData?.position ?? ""}
              onChange={(e) => handleChange("position", e.target.value)}
            />
            {/* <Input
              label="Địa chỉ"
              value={selectedData?.address ?? ""}
              onChange={(e) => handleChange("address", e.target.value)}
            /> */}
            <DateInput
              label="Ngày tham gia"
              value={
                selectedData?.createdAt
                  ? parseDate(formatDateForInput(selectedData.createdAt))
                  : null
              }
              onChange={(value) =>
                handleChange("createdAt", value?.toString() ?? "")
              }
            />
          </Form>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-4">
          <Button
            variant="bordered"
            className="px-6 py-2"
            onPress={() => handleClose(false)}
          >
            Đóng
          </Button>
          <Button
            variant="bordered"
            className="px-6 py-2 bg-primary text-white"
            isLoading={isSubmitting}
            onPress={handleUpdate}
          >
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}