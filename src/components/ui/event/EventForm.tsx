"use client";

import Editor from "@/components/ui/MyEditor";
import { Branch, Event, EventAggregate } from "@/lib/model/type";
import { Image, Input, Select, SelectItem, DatePicker, Modal, ModalContent, ModalBody, Button, useDisclosure } from "@heroui/react";
import { parseAbsoluteToLocal, DateValue, getLocalTimeZone, now } from "@internationalized/date";
import { useState } from "react";

interface EventFormProps {
  eventData: EventAggregate | null;
  branchData: Branch[];
  selectedBranch: Branch | null; // Thêm prop selectedBranch
  errors: Record<string, string>;
  imageFiles: File[]; // Ảnh mới (binary)
  onFieldChange: (name: string, value: string | DateValue | null) => void;
  onImageUpload: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void; // Xóa ảnh mới
  onRemoveExistingImage: (index: number) => void; // Xóa ảnh cũ
  editorContentRef: React.MutableRefObject<string>;
}

export default function EventForm({
  eventData = null,
  branchData,
  errors,
  imageFiles,
  onFieldChange,
  onImageUpload,
  onRemoveImage,
  onRemoveExistingImage,
  selectedBranch,
  editorContentRef,
}: EventFormProps) {
  const statusOptions = [
    { key: "UPCOMING", label: "Sắp diễn ra" },
    { key: "IN_PROGRESS", label: "Đang diễn ra" },
    { key: "FINISHED", label: "Đã kết thúc" },
    { key: "CANCELED", label: "Đã hủy" },
  ];
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleImageClick = (src: string) => {
    setPreviewImage(src);
    onOpen();
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-start text-gray-800 mb-[4rem]">Chi tiết sự kiện</h2>
      <Input
        name="title"
        label="Tên sự kiện"
        size="lg"
        labelPlacement="outside"
        placeholder="VD: Hội thảo công nghệ 2025"
        variant="bordered"
        value={eventData?.event.title ?? ""}
        errorMessage={errors.title}
        isInvalid={!!errors.title}
        onChange={(e) => onFieldChange("title", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-10 mt-10">
        <Select
          name="branchId"
          label="Nhà tổ chức"
          size="lg"
          labelPlacement="outside"
          variant="bordered"
          placeholder="Chọn nhà tổ chức"
          errorMessage={errors.branchId}
          isInvalid={!!errors.branchId}
          defaultSelectedKeys={selectedBranch ? [selectedBranch.id] : []}
          onChange={(e) => onFieldChange("branchId", e.target.value)}
        >
          {branchData?.map((branch) => (
            <SelectItem key={branch.id}>{branch.name}</SelectItem>
          ))}
        </Select>

        <Input
          name="location"
          label="Địa điểm tổ chức"
          size="lg"
          labelPlacement="outside"
          placeholder="VD: TP. Hồ Chí Minh"
          variant="bordered"
          errorMessage={errors.location}
          isInvalid={!!errors.location}
          value={eventData?.event.location ?? ""}
          onChange={(e) => onFieldChange("location", e.target.value)}
        />
      </div>

      <div className="mt-[4rem]">
        <Input
          name="ticketPrice"
          label="Giá vé"
          size="lg"
          labelPlacement="outside"
          placeholder="VD: 500,000 VND"
          variant="bordered"
          value={
            eventData?.event.ticketPrice
              ? new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
              }).format(Number(eventData.event.ticketPrice))
              : ""
          }
          errorMessage={errors.ticketPrice}
          isInvalid={!!errors.ticketPrice}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            onFieldChange("ticketPrice", rawValue);
          }}
          className="mt-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10">
        <DatePicker
          name="startDate"
          label="Ngày tổ chức"
          labelPlacement="outside"
          variant="bordered"
          hideTimeZone
          value={eventData?.event.startDate ? parseAbsoluteToLocal(eventData.event.startDate) : null}
          onChange={(value) => onFieldChange("startDate", value)}
          errorMessage={errors.startDate}
          granularity="minute"
          isInvalid={!!errors.startDate}
        />
        <DatePicker
          name="endDate"
          label="Ngày kết thúc"
          labelPlacement="outside"
          variant="bordered"
          hideTimeZone
          granularity="minute"
          value={eventData?.event.endDate ? parseAbsoluteToLocal(eventData.event.endDate) : null}
          onChange={(value) => onFieldChange("endDate", value)}
          errorMessage={errors.endDate}
          isInvalid={!!errors.endDate}
        />
        <DatePicker
          name="ticketClosingDate"
          granularity="minute"
          label="Ngày kết thúc bán vé"
          labelPlacement="outside"
          variant="bordered"
          hideTimeZone
          value={eventData?.event.ticketClosingDate ? parseAbsoluteToLocal(eventData.event.ticketClosingDate) : null}
          onChange={(value) => onFieldChange("ticketClosingDate", value)}
          errorMessage={errors.ticketClosingDate}
          isInvalid={!!errors.ticketClosingDate}
        />
      </div>

      <div>
        <p className="mb-2 mt-8">Hình ảnh sự kiện</p>
        <div className="flex gap-4 flex-wrap">
          {eventData?.event.images && eventData.event.images.length > 0 && eventData.event.images.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-20 h-20">
              <Image
                src={url}
                alt={`Ảnh hiện có ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(url)}
                aria-errormessage={errors.images}
                aria-invalid={!!errors.images}
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveExistingImage(index);
                }}
                style={{ zIndex: 9999 }}
              >
                ✕
              </button>
            </div>
          ))}
          {imageFiles.map((file, index) => (
            <div key={`new-${index}`} className="relative w-20 h-20">
              <Image
                src={URL.createObjectURL(file)}
                alt={`Ảnh mới ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(URL.createObjectURL(file))}
                aria-errormessage={errors.images}
                aria-invalid={!!errors.images}
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(index);
                }}
                style={{ zIndex: 9999 }}
              >
                ✕
              </button>
            </div>
          ))}
          <label className="w-20 h-20 flex items-center justify-center border rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-gray-500 text-2xl">+</span>
            <input type="file" multiple className="hidden" onChange={(e) => onImageUpload(e.target.files)} />
          </label>
        </div>
      </div>

      <div className="mt-10">
        <p className="mb-2">Nội dung sự kiện</p>
        <Editor
          content={eventData?.event.description ?? ""}
          onChange={(val) => {
            editorContentRef.current = val;
            onFieldChange("description", val);
          }}
        />
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          <ModalBody className="p-4">
            {previewImage && (
              <Image
                src={previewImage}
                alt="Preview"
                className="w-full max-h-[80vh] object-contain rounded-md"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}