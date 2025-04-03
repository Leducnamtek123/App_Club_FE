import { addSponsor, updateSponsor } from "@/services/event/eventSponsorService";
import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import Image from "next/image"; // Thêm import Image từ Next.js
import { useEffect, useState } from "react";

export default function AddSponsorForm({
  isModalOpen,
  setIsModalOpen,
  branchData,
  usersData,
  onSponsorAdded,
  sponsorData,
  eventInfo,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventTitle: "",
    createdBy: "",
    eventDate: "",
    sponsor: "",
    amount: "",
    note: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Thay logoFile bằng imageFiles
  const [existingImages, setExistingImages] = useState<string[]>([]); // Hình ảnh hiện có từ sponsorData
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const usersName = usersData;
  const modalTitle = sponsorData ? "Cập nhật" : "Thêm nhà tài trợ";

  useEffect(() => {
    if (isModalOpen) {
      const selectedEvent = localStorage.getItem("selectedEvent");
      if (selectedEvent) {
        try {
          const parsedData = JSON.parse(selectedEvent);
          const parsedDate = new Date(parsedData.createdAt).toLocaleDateString("vi-VN");
          setFormData({
            eventTitle: parsedData.event?.title || "",
            createdBy: parsedData.event?.branch?.name || "",
            eventDate: parsedDate || "",
            sponsor: sponsorData ? (sponsorData.sponsorId || sponsorData.sponsor || "") : "",
            amount: sponsorData ? (sponsorData.amount || "") : "",
            note: sponsorData ? (sponsorData.note || "") : "",
          });
          // Đặt hình ảnh hiện có từ sponsorData (nếu có)
          setExistingImages(sponsorData?.logo ? [sponsorData.logo] : []);
          setImageFiles([]); // Reset hình ảnh mới khi mở modal
          setErrors({});
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
        }
      }
    }
  }, [isModalOpen, sponsorData]);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      const selectedEvent = localStorage.getItem("selectedEvent");
      if (selectedEvent) {
        const parsedData = JSON.parse(selectedEvent);
        const parsedDate = new Date(parsedData.createdAt).toLocaleDateString("vi-VN");
        setFormData({
          eventTitle: parsedData.event?.title || "",
          createdBy: parsedData.event?.branch?.name || "",
          eventDate: parsedDate || "",
          sponsor: "",
          amount: "",
          note: "",
        });
      } else {
        setFormData({
          eventTitle: "",
          createdBy: "",
          eventDate: "",
          sponsor: "",
          amount: "",
          note: "",
        });
      }
      setImageFiles([]);
      setExistingImages([]);
      setErrors({});
    }
  };

  const handleInputChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (value && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const onImageUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const onRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (url: string) => {
    window.open(url, "_blank"); // Mở hình ảnh trong tab mới khi click
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.sponsor) newErrors.sponsor = "Vui lòng chọn nhà tài trợ";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Vui lòng nhập số tiền hợp lệ (lớn hơn 0)";
    if (!formData.note) newErrors.note = "Vui lòng nhập ghi chú";
    
    // ✅ Kiểm tra xem có ít nhất một hình ảnh không
    if (existingImages.length === 0 && imageFiles.length === 0) {
      newErrors.logo = "Vui lòng tải lên ít nhất một hình ảnh logo";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleConfirm = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedEvent = localStorage.getItem("selectedEvent");
      const parsedData = JSON.parse(selectedEvent);
      const eventId = parsedData.id;
      const payload = new FormData();
      payload.append("sponsorId", formData.sponsor);
      payload.append("eventId", eventId);
      payload.append("amount", formData.amount);
      payload.append("note", formData.note);
      imageFiles.forEach((file) => payload.append("logo", file)); // Gửi tất cả file mới

      if (sponsorData && sponsorData.id) {
        const sponsorId = sponsorData.id;
        await updateSponsor(payload, sponsorId);
        addToast({
          title: "Thành công",
          description: "Cập nhật tài trợ thành công!",
          color: "success",
          classNames: { base: "z-3" },
        });
      } else {
        await addSponsor(payload);
        addToast({
          title: "Thành công",
          description: "Thêm tài trợ thành công!",
          color: "success",
          classNames: { base: "z-3" },
        });
      }
      handleClose(false);
      if (onSponsorAdded) onSponsorAdded();
    } catch (error: any) {
      addToast({
        title: "Lỗi",
        description: `Đã có lỗi xảy ra khi ${sponsorData ? "cập nhật" : "ghi nhận"} tài trợ: ${error.message}`,
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
      <ModalContent className="max-w-2xl w-full p-8 rounded-2xl shadow-2xl bg-white">
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          {modalTitle}
        </ModalHeader>
        <ModalBody>
          <Form className="grid gap-5">
            <Input label="Sự kiện" value={formData.eventTitle} isDisabled />
            <div className="grid grid-cols-2 gap-5">
              <Input label="Nhà tổ chức" value={formData.createdBy} isDisabled />
              <Input label="Ngày bắt đầu" value={formData.eventDate} isDisabled />
              <Autocomplete
                label="Nhà tài trợ"
                value={formData.sponsor}
                isDisabled={!formData.sponsor ? false : true}
                defaultInputValue={
                  sponsorData && usersName?.length > 0
                    ? usersName.find((user: any) => user.id === sponsorData.sponsorId)?.name || ""
                    : ""
                }
                onValueChange={handleInputChange("sponsor")}
                onSelectionChange={(key) => handleInputChange("sponsor")(key as string)}
                isInvalid={!!errors.sponsor}
                errorMessage={errors.sponsor}
              >
                {usersName?.length > 0 ? (
                  usersName.map((data: any) => (
                    <AutocompleteItem key={data.id}>{data.name}</AutocompleteItem>
                  ))
                ) : (
                  <AutocompleteItem key="no-data" isDisabled>
                    Không có nhà tài trợ nào
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <Input
                label="Số tiền"
                placeholder="VNĐ"
                type="number"
                value={formData.amount}
                onValueChange={handleInputChange("amount")}
                isInvalid={!!errors.amount}
                errorMessage={errors.amount}
              />
            </div>
            {/* Thay phần Input logo bằng giao diện chọn hình ảnh */}
            <div>
              <p className="mb-2 mt-8">Hình ảnh logo</p>
              <div className="flex gap-4 flex-wrap">
                {existingImages.length > 0 &&
                  existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative w-20 h-20">
                      <Image
                        src={url}
                        alt={`Ảnh hiện có ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(url)}
                        width={80}
                        height={80}
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
                      width={80}
                      height={80}
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
                      {errors.logo && <p className="text-[#E51C6E] text-sm">{errors.logo}</p>}

                    </div>
                  ))}

                  <label className="w-20 h-20 flex items-center justify-center border rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-gray-500 text-2xl">+</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onImageUpload(e.target.files)}
                    />
                  </label>
                </div>
                {errors.logo && <p className="text-[#E51C6E] text-sm">{errors.logo}</p>}

              </div>
              <Textarea
                value={formData.note}
                label="Ghi chú"
                onValueChange={handleInputChange("note")}
                isInvalid={!!errors.note}
                errorMessage={errors.note}
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
              isLoading={isSubmitting}
              onPress={handleConfirm}
              isDisabled={!formData.sponsor || !formData.amount || !formData.note}
            >
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }