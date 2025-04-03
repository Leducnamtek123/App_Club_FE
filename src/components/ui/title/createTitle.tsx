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
import { Title } from "@/lib/model/type";
import { createTitle, updateTitle } from "@/services/title/titleServices";

interface ModalCreateItemProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    setSelectedData: (data: Title | null) => void; // Sửa type từ Title[] thành Title | null
    refreshData: () => void;
    selectedItem?: Title | null;
}

export default function ModalCreateItem({
    isModalOpen,
    setIsModalOpen,
    setSelectedData,
    refreshData,
    selectedItem
}: ModalCreateItemProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set form values when editing
    useEffect(() => {
        if (selectedItem && isModalOpen) {
            setName(selectedItem.name || "");
            setDescription(selectedItem.description || "");
            setFile(null); // File không được preload khi chỉnh sửa
        } else {
            setName("");
            setDescription("");
            setFile(null);
        }
    }, [selectedItem, isModalOpen]);

    const handleClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            // Reset form và selectedItem khi đóng
            setName("");
            setDescription("");
            setFile(null);
            setSelectedData(null);
        }
    };

    const validateForm = () => {
        if (!name.trim()) {
            addToast({
                title: "Lỗi",
                description: "Tên không được để trống.",
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
        
        // Chỉ yêu cầu file khi tạo mới, không yêu cầu khi cập nhật
        if (!selectedItem && !file) {
            addToast({
                title: "Lỗi",
                description: "Vui lòng chọn một file.",
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

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        if (file) formData.append("icon", file);

        setIsSubmitting(true);
        try {
            if (selectedItem) {
                await updateTitle(selectedItem.id, formData);
                addToast({
                    title: "Thành công",
                    description: "Cập nhật danh hiệu thành công.",
                    variant: "solid",
                    color: "success",
                    classNames: { base: "z-3" },
                });
            } else {
                await createTitle(formData);
                addToast({
                    title: "Thành công",
                    description: "Tạo danh hiệu thành công.",
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
                    {selectedItem ? "Cập nhật danh hiệu" : "Tạo danh hiệu mới"}
                </ModalHeader>
                <ModalBody>
                    <Form className="flex flex-col gap-6">
                        <Input
                            label="Tên"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên"
                            isRequired
                        />
                        <Input
                            label="Mô tả"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả"
                            isRequired
                        />
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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