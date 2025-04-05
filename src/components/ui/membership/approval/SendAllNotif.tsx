import { useState, useEffect } from "react";
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
import { sendNotif } from "@/services/notification/notificationServices";

export default function SendAllNotificationForm({
  isModalOpen,
  setIsModalOpen,
  selectedMembers,
  memberData,
  branchData,
  onNotificationSent,
}: any) {
  // Lấy thông tin user từ localStorage
  const userRole = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;
  const userBranchId = parsedUser?.branch?.id; // Lấy branch.id từ user trong localStorage

  // Nếu có selectedMembers thì mặc định là "individual", ngược lại là "all" hoặc "branch" nếu là ADMIN
  const [notificationType, setNotificationType] = useState(
    selectedMembers && selectedMembers.length > 0 ? "individual" : (role === "ADMIN" ? "branch" : "all")
  );
  const [selectedBranch, setSelectedBranch] = useState<string | null>(userBranchId || null); // Mặc định là branch.id từ localStorage
  const [selectedUsers, setSelectedUsers] = useState<any[]>(selectedMembers || []);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Danh sách các loại thông báo
  const notificationTypes = [
    { key: "all", label: "Toàn bộ" },
    { key: "branch", label: "Theo chi hội" },
    { key: "individual", label: "Cá nhân" },
  ];

  // Lọc notificationTypes dựa trên role
  const filteredNotificationTypes = role === "ADMIN"
    ? notificationTypes.filter((type) => type.key !== "all") // Ẩn "Toàn bộ" nếu là ADMIN
    : notificationTypes;

  // Cập nhật selectedUsers khi selectedMembers thay đổi
  useEffect(() => {
    if (selectedMembers && selectedMembers.length > 0) {
      setNotificationType("individual");
      setSelectedUsers(selectedMembers);
    } else {
      setNotificationType(role === "ADMIN" ? "branch" : "all"); // Nếu là ADMIN, mặc định là "branch"
      setSelectedUsers([]);
    }
    // Đảm bảo selectedBranch luôn là branch.id từ localStorage
    setSelectedBranch(userBranchId || null);
  }, [selectedMembers, role, userBranchId]);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setNotificationType(selectedMembers && selectedMembers.length > 0 ? "individual" : (role === "ADMIN" ? "branch" : "all"));
      setSelectedBranch(userBranchId || null); // Reset về branch.id từ localStorage
      setSelectedUsers(selectedMembers || []);
      setMessage("");
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const payload: any = { message };

      if (notificationType === "branch" && selectedBranch) {
        payload.branchId = selectedBranch;
      } else if (notificationType === "individual" && selectedUsers.length > 0) {
        payload.userIds = selectedUsers.map((user) => user.id);
      }

      const response = await sendNotif(payload);
      addToast({
        title: "Thành công",
        description: "Gửi thông báo thành công",
        variant: "bordered",
        color: "success",
      });
      setIsModalOpen(false); // Đóng modal sau khi gửi thành công
      if (onNotificationSent) onNotificationSent();
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
              {filteredNotificationTypes.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              ))}
            </Select>

            {notificationType === "branch" && (
              <Autocomplete
                label="Chọn chi hội"
                placeholder="Nhập để tìm chi hội"
                selectedKey={selectedBranch} // Giá trị mặc định là branch.id từ localStorage
                isDisabled={true} // Vô hiệu hóa để không thay đổi được
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
                    const selectedUser = memberData.find((user: any) => user.id === key);
                    if (selectedUser && !selectedUsers.some((u) => u.id === selectedUser.id)) {
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
                        {user.name} {/* Hiển thị tên người được chọn */}
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
              (notificationType === "individual" && selectedUsers.length === 0) ||
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