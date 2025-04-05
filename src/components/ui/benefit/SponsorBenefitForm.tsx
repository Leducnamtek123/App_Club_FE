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
    Textarea,
    addToast
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Benefit } from "@/lib/model/type";
import { addSponsorBenefit, updateSponsorBenefit } from "@/services/sponsor-benefit/sponsorBenefitService";

interface ModalCreateItemProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    setSelectedData: (data: Benefit | null) => void;
    refreshData: () => void;
    selectedItem?: Benefit | null;
}

export default function ModalCreateSponsorBenefit({
    isModalOpen,
    setIsModalOpen,
    setSelectedData,
    refreshData,
    selectedItem
}: ModalCreateItemProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedItem && isModalOpen) {
            setTitle(selectedItem.title || "");
            setDescription(selectedItem.description || "");
        } else {
            setTitle("");
            setDescription("");
        }
    }, [selectedItem, isModalOpen]);

    const handleClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setTitle("");
            setDescription("");
            setSelectedData(null);
        }
    };

    const validateForm = () => {
        if (!title.trim()) {
            addToast({
                title: "Lỗi",
                description: "Tiêu đề không được để trống.",
                variant: "solid",
                color: "danger",
                classNames: { base: "z-3" },
            });
            return false;
        }
        
        if (!description.trim()) {
            addToast({
                title: "Lỗi",
                description: "Mô tả không được để trống.",
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

        const benefitData = {
            title: title,
            description: description
        };

        setIsSubmitting(true);
        try {
            if (selectedItem?.id) {
                // Update existing benefit
                await updateSponsorBenefit(selectedItem.id, benefitData);
                addToast({
                    title: "Thành công",
                    description: "Cập nhật quyền lợi nhà tài trợ thành công.",
                    variant: "bordered",
                    color: "success",
                    classNames: { base: "z-3" },
                });
            } else {
                // Create new benefit
                await addSponsorBenefit(benefitData);
                addToast({
                    title: "Thành công",
                    description: "Tạo quyền lợi nhà tài trợ thành công.",
                    variant: "bordered",
                    color: "success",
                    classNames: { base: "z-3" },
                });
            }
            
            refreshData();
            handleClose(false);
        } catch (error) {
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
                    {selectedItem ? "Cập nhật quyền lợi" : "Tạo quyền lợi mới"}
                </ModalHeader>
                <ModalBody>
                    <Form className="flex flex-col gap-6">
                        <Input
                            label="Tiêu đề"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề"
                            isRequired
                        />
                        <Textarea
                            label="Mô tả"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả"
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
                        {selectedItem ? "Cập nhật" : "Tạo"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}