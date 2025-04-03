"use client"

import {
    Button,
    Form,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    addToast
} from "@heroui/react";
import { useState } from "react";
import { changePassword } from "@/services/membership_leader/membershipLeaderServices";


export default function ChangePassword({
    isModalOpen,
    setIsModalOpen,
    selectedData,
    refreshData,
}: {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    selectedData: any | null;
    refreshData: () => void;
}) {

    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleClose = (open: boolean) => {
        setIsModalOpen(open);

        // Only reset data when actually submitting, NOT when closing
        if (!open && selectedData) {
            setNewPassword("");
        }
    };

    const handleCreate = async () => {
        console.log("handleCreate triggered");

        if (!newPassword.trim()) {
            addToast({
                title: "Lỗi",
                description: "Mật khẩu không được để trống.",
                color: "danger",
                classNames: { base: "z-3" },
            });
            return;
        }

        const payload = {
            userId: selectedData?.id,
            newPassword: newPassword,
        };

        setIsSubmitting(true);
        try {
            console.log("Payload", payload);

            const response = await changePassword(payload);
            addToast({
                title: "Thành công",
                description: "Đổi mật khẩu thành công.",
                color: "success",
                classNames: { base: "z-3" },
            });
            setIsModalOpen(false);
            refreshData();
            handleClose(false);
        } catch (error) {
            addToast({
                title: "Lỗi",
                description: "Đổi mật khẩu thất bại.",
                color: "danger",
                classNames: { base: "z-3" },
            });
        }
        setIsSubmitting(false);
    }

    return (
        <Modal isOpen={isModalOpen} onOpenChange={handleClose} classNames={{ backdrop: "z-2" }}>
            <ModalContent className="max-w-3xl w-full p-8 rounded-2xl shadow-2xl bg-white">
                <ModalHeader className="text-2xl font-semibold text-gray-800">
                    Đổi mật khẩu
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        className="mb-4"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="bordered" className="px-6 py-2" onPress={() => handleClose(false)}>
                        Hủy
                    </Button>
                    <Button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        onPress={handleCreate}
                        isLoading={isSubmitting}
                    >
                        Xác Nhận
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

    );
};