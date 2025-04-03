import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Chip,
  addToast,
} from "@heroui/react";
import axios from "axios"; // Giả định sử dụng axios, bạn có thể thay bằng fetch nếu muốn
import { sendNotif } from "@/services/notification/notificationServices";

export default function SendAllNotificationForm({
  isModalOpen,
  setIsModalOpen,
  selectedMembers,
  memberData,
  branchData,
  onNotificationSent,
}: any) {
  const [notificationType, setNotificationType] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any[]>(
    selectedMembers || []
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading khi gửi API

  const notificationTypes = [
    { key: "all", label: "Toàn bộ" },
    { key: "branch", label: "Theo chi hội" },
    { key: "individual", label: "Cá nhân" },
  ];

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setNotificationType("all");
      setSelectedBranch(null);
      setSelectedUsers(selectedMembers || []);
      setMessage("");
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Chuẩn bị payload dựa trên notificationType
      const payload: any = {
        message,
      };

      if (notificationType === "branch" && selectedBranch) {
        payload.branchId = selectedBranch;
      } else if (
        notificationType === "individual" &&
        selectedUsers.length > 0
      ) {
        payload.userIds = selectedUsers.map((user) => user.id);
      }

      const response = await sendNotif(payload);
      addToast({
        title: "Thành công",
        description: "Gửi thông báo thành công",
        variant: "bordered",
        color: "success",
      });
      setIsModalOpen();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Gửi thông báo thất bại",
        variant: "solid",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <Modal isOpen={isModalOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-lg w-full p-8 rounded-2xl shadow-2xl bg-white">
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          Gửi thông báo Zalo
        </ModalHeader>
        <ModalBody>
          <Form className="grid gap-5">
            <Select
              label="Loại thông báo"
              placeholder="Chọn loại thông báo"
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
              className="w-full"
            >
              {notificationTypes.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              ))}
            </Select>

            {notificationType === "branch" && (
              <Autocomplete
                label="Chọn chi hội"
                placeholder="Nhập để tìm chi hội"
                onSelectionChange={(key) =>
                  setSelectedBranch(key as string | null)
                }
                className="w-full"
              >
                {branchData?.map((branch: any) => (
                  <AutocompleteItem key={branch.id}>
                    {branch.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}

            {notificationType === "individual" && (
              <>
                <Autocomplete
                  label="Chọn hội viên"
                  placeholder="Nhập để tìm hội viên"
                  onSelectionChange={(key) => {
                    const selectedUser = memberData.find(
                      (user: any) => user.id === key
                    );
                    if (
                      selectedUser &&
                      !selectedUsers.some((u) => u.id === selectedUser.id)
                    ) {
                      setSelectedUsers((prev) => [...prev, selectedUser]);
                    }
                  }}
                  className="w-full"
                >
                  {memberData?.map((user: any) => (
                    <AutocompleteItem key={user.id}>
                      {user.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map((user: any) => (
                      <Chip
                        key={user.id}
                        onClose={() => handleUserRemove(user.id)}
                        variant="solid"
                        color="primary"
                        className="cursor-pointer"
                      >
                        {user.name}
                      </Chip>
                    ))}
                  </div>
                )}
              </>
            )}

            <Textarea
              className="max-w"
              label="Nội dung thông báo"
              placeholder="Nhập nội dung của bạn"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Form>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-4">
          <Button
            variant="bordered"
            className="px-6 py-2"
            onPress={() => handleClose(false)}
            isDisabled={isLoading}
          >
            Đóng
          </Button>
          <Button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onPress={handleSend}
            isLoading={isLoading}
            isDisabled={
              (notificationType === "branch" && !selectedBranch) ||
              (notificationType === "individual" &&
                selectedUsers.length === 0) ||
              !message ||
              isLoading
            }
          >
            Gửi thông báo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
