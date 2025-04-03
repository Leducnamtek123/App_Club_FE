"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { FaExclamationTriangle } from "react-icons/fa"; // Icon cảnh báo từ react-icons

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  note?: string; // Thêm phần chú ý tùy chọn
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "success" | "warning";
  className?:string; // Màu nút xác nhận
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  note, // Nội dung chú ý tùy chọn
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "primary",
 // Màu mặc định của nút xác nhận
}: ConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      classNames={{
        base: "rounded-lg shadow-lg", // Bo góc và bóng cho modal
        backdrop: "bg-gray-900/50", // Làm mờ nền
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 bg-gray-100 rounded-t-lg">
          <FaExclamationTriangle className="text-yellow-500" size={20} /> {/* Icon cảnh báo */}
          <span className="text-lg font-semibold text-gray-800">{title}</span>
        </ModalHeader>
        <ModalBody className="py-4">
          <p className="text-gray-700 text-sm">{message}</p>
          {note && (
            <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
              <p className="text-yellow-800 text-sm font-medium">{note}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex justify-end gap-2">
          <Button
            color="default"
            variant="light"
            onPress={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            {cancelText}
          </Button>
          <Button
            color={confirmColor}
            onPress={() => {
              onConfirm();
              onClose();
            }}
            className="font-medium"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}