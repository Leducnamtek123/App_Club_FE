import {
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
    SelectItem
} from "@heroui/react";
import { parseDate } from "@internationalized/date";


export const role = [
    { key: "user", label: "User" },
    { key: "admin", label: "Admin" },
    { key: "superadmin", label: "Super admin" }
]


export default function MemberShipDetailForm({
    isModalOpen,
    setIsModalOpen,
    selectedData,
    setSelectedData
}: any) {

    const handleClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setSelectedData(null); // Reset dữ liệu khi modal đóng
        }
    };

    // Hàm xử lý cập nhật dữ liệu
    const handleChange = (key: string, value: string) => {
        setSelectedData((prev: any) => ({
            ...prev,
            [key]: value
        }));
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
                            value={selectedData?.fullName ?? ""}
                            isDisabled
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={selectedData?.email ?? ""}
                            isDisabled
                        />
                        <Input
                            label="Số điện thoại"
                            value={selectedData?.phone ?? ""}
                            isDisabled
                        />
                        <Input
                            label="Công ty"
                            value={selectedData?.companyName ?? ""}
                            isDisabled
                        />
                        <Input
                            label="Chi hội"
                            value={selectedData?.group ?? ""}
                            isDisabled
                        />
                        <Input
                            label="Địa chỉ"
                            value={selectedData?.address ?? ""}
                            isDisabled
                        />

                        {/* chọn để thay đổi user role */}
                        <Select
                            className="max-w-xs"
                            items={role}
                            label="Role"
                            placeholder="Select a role"
                            selectedKeys={selectedData?.role ? new Set([selectedData?.role]) : new Set()}
                            onSelectionChange={(keys) => {
                                const selectedValue = Array.from(keys)[0]; // Get the first selected value
                                handleChange("role", selectedValue.toString()); // Update selectedData.role
                            }}
                        >
                            {role.map((item) => (
                                <SelectItem key={item.key}>{item.label}</SelectItem>
                            ))}
                        </Select>

                        <DateInput
                            label="Ngày tham gia"
                            value={selectedData?.joinDate ? parseDate(selectedData.joinDate) : null}
                            isDisabled
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
                    <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Lưu thay đổi
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
