"use client";

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
import { useState, useEffect } from "react";
import { createMembershipFee, updateMembershipFee } from "@/services/membership_fee/membershipFeeServices";
import { MembershipFee } from "@/lib/model/type";

interface ModalCreateMembershipFeeProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    setSelectedData: (data: MembershipFee[]) => void;
    refreshData: () => void;
    selectedFee?: MembershipFee | null;
}

export default function ModalCreateMembershipFee({
    isModalOpen,
    setIsModalOpen,
    setSelectedData,
    refreshData,
    selectedFee
}: ModalCreateMembershipFeeProps) {
    const [year, setYear] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set form values when editing
    useEffect(() => {
        if (selectedFee) {
            setYear(selectedFee.year.toString());
            setAmount(selectedFee.amount.toString());
        } else {
            setYear("");
            setAmount("");
        }
    }, [selectedFee, isModalOpen]);

    const handleClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            // Reset form when closing
            setYear("");
            setAmount("");
        }
    };

    const validateForm = () => {
        if (!year.trim()) {
            addToast({
                title: "Lỗi",
                description: "Năm hội phí không được để trống.",
                variant: "solid",
                color: "danger",
                classNames: { base: "z-3" },
            });
            return false;
        }
        
        if (!amount.trim()) {
            addToast({
                title: "Lỗi",
                description: "Số tiền không được để trống.",
                variant: "solid",
                color: "danger",
                classNames: { base: "z-3" },
            });
            return false;
        }
        
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const payload = { 
            year: parseInt(year), 
            amount: parseFloat(amount) 
        };
        
        setIsSubmitting(true);
        try {
            if (selectedFee) {
                // Update existing fee
                await updateMembershipFee(selectedFee.year, payload);
                addToast({
                    title: "Thành công",
                    description: "Cập nhật hội phí thành công.",
                    variant: "solid",
                    color: "success",
                    classNames: { base: "z-3" },
                });
            } else {
                // Create new fee
                await createMembershipFee(payload);
                addToast({
                    title: "Thành công",
                    description: "Tạo hội phí năm thành công.",
                    variant: "solid",
                    color: "success",
                    classNames: { base: "z-3" },
                });
            }
            
            refreshData();
            handleClose(false);
        } catch (error: any) {
            console.error("Error:", error);
            addToast({
                title: "Lỗi",
                description: error.response?.data?.message || "Đã có lỗi xảy ra",
                variant: "solid",
                color: "danger",
                classNames: { base: "z-3" },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            isOpen={isModalOpen} 
            onOpenChange={handleClose} 
            classNames={{ backdrop: "z-2" }}
        >
            <ModalContent className="max-w-lg w-1/3 p-8 rounded-2xl shadow-2xl bg-white">
                <ModalHeader className="text-2xl font-semibold text-gray-800">
                    {selectedFee ? "Chỉnh sửa hội phí" : "Tạo hội phí mới"}
                </ModalHeader>
                <ModalBody>
                    <Form className="flex flex-col gap-6">
                        <Input
                            label="Năm"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="Nhập năm"
                            isRequired
                        />
                        <Input
                            label=" Số tiền (VNĐ)"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền"
                            isRequired
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
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        onPress={handleSubmit}
                        isLoading={isSubmitting}
                    >
                        {selectedFee ? "Cập nhật" : "Tạo"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}