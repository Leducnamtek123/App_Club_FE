import { feeReminder } from "@/services/notification/feeReminderServicecs";
import {
  addToast,
  Button,
  Chip,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useEffect, useState } from "react";

export default function FeeReminderNotif({
  isModalOpen,
  setIsModalOpen,
  selectedData,
  allYears,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedData: any;
  allYears: number[];
}) {
  const [formData, setFormData] = useState<{
    year: number;
    userIds: { id: string; name: string }[]; // Lưu cả id và name
  }>({
    year: new Date().getFullYear(),
    userIds: [], // Khởi tạo rỗng ban đầu
  });

  // Đồng bộ formData.userIds với selectedData khi selectedData thay đổi
  useEffect(() => {
    const newUserIds = Array.isArray(selectedData)
      ? selectedData
          .map((item: any) => ({
            id: item.id,
            name: item.name,
          }))
          .filter((item) => item.id && item.name) // Lọc bỏ các mục không hợp lệ
      : selectedData?.id && selectedData?.name
      ? [{ id: selectedData.id, name: selectedData.name }]
      : [];
    setFormData((prev) => ({
      ...prev,
      userIds: newUserIds,
    }));
  }, [selectedData]);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
  };

  const handleSubmit = async () => {
    const payload = {
      year: formData.year,
      userIds: Array.from(new Set(formData.userIds.map((user) => user.id))), // Chỉ lấy id và loại bỏ trùng lặp
    };
    try {
      const response = await feeReminder(payload);
      if (response.status == "success") {
        addToast({
          title: "Thành công",
          description: "Gửi thông báo nhắc phí thành công.",
          variant: "bordered",
          color: "success",
        });
      }else if(response.status === "failed"){
        addToast({
          title: "Thất bại",
          description: response.reason,
          variant: "bordered",
          color: "success",
        });
      }

      handleClose(false);
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Gửi thông báo nhắc phí thất bại.",
        variant: "solid",
        color: "danger",
      });
    }
    handleClose(false);
  };

  const removeUserId = (idToRemove: string) => {
    const updatedUserIds = formData.userIds.filter(
      (user) => user.id !== idToRemove
    );
    setFormData({
      ...formData,
      userIds: updatedUserIds,
    });
  };

  return (
    <Modal isOpen={isModalOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-lg w-full p-8 rounded-2xl shadow-2xl bg-white">
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          Gửi thông báo
        </ModalHeader>
        <ModalBody>
          <Form className="grid gap-5">
            <Select
              label="Năm"
              variant="bordered"
              placeholder="Chọn năm"
              selectedKeys={[formData.year.toString()]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: parseInt(e.target.value, 10) || formData.year,
                })
              }
              className="w-full"
            >
              {allYears.map((year) => (
                <SelectItem key={year.toString()}>{year.toString()}</SelectItem>
              ))}
            </Select>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                User IDs
              </label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {formData.userIds.length > 0 ? (
                  formData.userIds.map((user) => (
                    <Chip
                      key={user.id}
                      variant="solid"
                      color="primary"
                      onClose={() => removeUserId(user.id)}
                      className="cursor-pointer"
                    >
                      {user.name} {/* Hiển thị name trong Chip */}
                    </Chip>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">
                    Không có User ID nào được chọn
                  </span>
                )}
              </div>
            </div>
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onPress={handleSubmit}
          >
            Gửi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
