import {
  AddTitleForUser,
  deleteTitleFromUser,
} from "@/services/title/titleServices";
import {
  addToast,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import { useState } from "react";

export default function TitleAdded({
  isModalOpen,
  setIsModalOpen,
  selectedData,
  setSelectedData,
  onTitleAdded,
  titleData,
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
        return { [key]: value };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleUpdate = async () => {
    console.log("Dữ liệu trước khi gửi:", selectedData);
    setIsSubmitting(true);

    try {
      if (!selectedData?.id) {
        throw new Error("Không tìm thấy ID người dùng.");
      }
      if (!selectedData?.title) {
        throw new Error("Vui lòng chọn danh hiệu.");
      }

      const response = await AddTitleForUser(
        selectedData.id,
        selectedData.title
      );
      console.log("Response từ server:", response);

      if (response) {
        addToast({
          title: "Thành công",
          description: "Gán danh hiệu cho người dùng thành công.",
          variant: "bordered",
          color: "success",
        });
        handleClose(false);
        onTitleAdded();
      }
    } catch (error) {
      console.error("Lỗi khi gán danh hiệu:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Gán danh hiệu thất bại.",
        variant: "bordered",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTitle = async (titleId: string) => {
    console.log("Xóa danh hiệu:", titleId);
    try {
      if (!selectedData?.id) {
        throw new Error("Không tìm thấy ID người dùng.");
      }

      const response = await deleteTitleFromUser(selectedData.id,titleId);
      console.log("Response từ server khi xóa:", response);

      if (response) {
        // Cập nhật danh sách titles trong selectedData
        setSelectedData((prev: any) => ({
          ...prev,
          titles: prev.titles.filter((title: any) => title.id !== titleId),
        }));

        addToast({
          title: "Thành công",
          description: "Xóa danh hiệu thành công.",
          variant: "bordered",
          color: "success",
        });
        onTitleAdded(); // Gọi callback để cập nhật danh sách bên ngoài nếu cần
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh hiệu:", error);
      addToast({
        title: "Lỗi",
        description: error.message || "Xóa danh hiệu thất bại.",
        variant: "bordered",
        color: "danger",
      });
    }
  };

  return (
    <Modal isOpen={isModalOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-lg w-full p-8 rounded-2xl shadow-2xl bg-white">
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          Gán danh hiệu
        </ModalHeader>
        <ModalBody>
          <Form className="grid gap-6">
            <Input
              label="Người dùng"
              value={selectedData?.name ?? ""}
              onChange={(e) => handleChange("id", e.target.value)}
              isDisabled
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Danh hiệu hiện tại
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedData?.titles?.length > 0 ? (
                  selectedData.titles.map((title: any) => (
                    <Chip
                      key={title.id}
                      variant="bordered"
                      color="primary"
                      className="text-sm"
                      endContent={
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleRemoveTitle(title.id)}
                        >
                          ✕
                        </Button>
                      }
                    >
                      {title.name}
                    </Chip>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    Chưa có danh hiệu nào
                  </span>
                )}
              </div>
            </div>
            <Select
              label="Danh hiệu mới"
              selectedKeys={selectedData?.title ? [selectedData.title] : []}
              onChange={(e) => handleChange("title", e.target.value)}
            >
              {titleData?.map((title: any) => (
                <SelectItem key={title.id}>{title.name}</SelectItem>
              ))}
            </Select>
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
            Gán danh hiệu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
