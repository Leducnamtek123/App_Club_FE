"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@/components/ui/MyEditor";
import { Image, Input, Modal, ModalContent, ModalBody, Button, useDisclosure } from "@heroui/react";
import { addToast } from "@heroui/react";

interface IntroductionData {
  id?: string;
  content?: string;
  images?: string[]; // Ảnh phụ (URL)
  mainImage?: string; // Ảnh chính (URL)
}

interface IntroductionFormProps {
  initialData?: IntroductionData;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function IntroductionForm({ initialData = {}, onSubmit }: IntroductionFormProps) {
  const [subImageFiles, setSubImageFiles] = useState<File[]>([]); // Ảnh phụ mới (binary)
  const [existingSubImages, setExistingSubImages] = useState<string[]>(initialData.images || []); // Ảnh phụ hiện có (URL)
  const [mainImage, setMainImage] = useState<string | null>(initialData.mainImage || null); // Ảnh chính hiện có (URL)
  const [newMainImage, setNewMainImage] = useState<File | null>(null); // Ảnh chính mới (binary)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Danh sách URL ảnh bị xóa
  const editorContentRef = useRef<string>(initialData.content || "");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setExistingSubImages(initialData.images || []);
    setMainImage(initialData.mainImage || null);
    setSubImageFiles([]);
    setNewMainImage(null);
    setImagesToDelete([]); // Reset danh sách ảnh bị xóa khi initialData thay đổi
    editorContentRef.current = initialData.content || "";
  }, [initialData]);

  // Xử lý upload ảnh chính
  const handleMainImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (newMainImage || mainImage) {
      addToast({
        title: "Lỗi",
        description: "Chỉ được upload 1 ảnh chính",
        color: "danger",
      });
      return;
    }
    setNewMainImage(files[0]);
  };

  // Xử lý upload ảnh phụ
  const handleSubImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const totalSubImages = subImageFiles.length + existingSubImages.length + newFiles.length;

    if (totalSubImages > 5) {
      addToast({
        title: "Lỗi",
        description: "Tối đa chỉ được upload 5 ảnh phụ",
        color: "danger",
      });
      return;
    }
    setSubImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveSubImage = (index: number) => {
    setSubImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingSubImage = (index: number) => {
    const removedImage = existingSubImages[index];
    setExistingSubImages((prev) => prev.filter((_, i) => i !== index));
    if (removedImage) {
      setImagesToDelete((prev) => [...prev, removedImage]); // Thêm URL ảnh phụ bị xóa vào danh sách
    }
  };

  const handleRemoveMainImage = () => {
    if (newMainImage) {
      setNewMainImage(null);
    } else if (mainImage) {
      setImagesToDelete((prev) => [...prev, mainImage]); // Thêm URL ảnh chính bị xóa vào danh sách
      setMainImage(null);
    }
  };

  const handleImageClick = (src: string) => {
    setPreviewImage(src);
    onOpen();
  };

  const handleSubmit = async () => {
    if (!newMainImage && !mainImage) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng upload ảnh chính",
        color: "danger",
      });
      return;
    }

    if (!editorContentRef.current) {
      addToast({
        title: "Lỗi",
        description: "Nội dung không được để trống",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", editorContentRef.current);

      // Gộp ảnh chính và ảnh phụ vào field "files"
      if (newMainImage) {
        formData.append("files", newMainImage);
      }
      subImageFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Gửi danh sách ảnh phụ hiện có (existingSubImages) nếu có
      existingSubImages.forEach((url) => {
        formData.append("existingFiles", url);
      });

      // Gửi danh sách ảnh bị xóa (imagesToDelete) nếu có
      imagesToDelete.forEach((url) => {
        formData.append("imagesToDelete", url);
      });

      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      addToast({
        title: "Lỗi",
        description: "Lưu thông tin thất bại",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      subImageFiles.forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
      if (newMainImage) URL.revokeObjectURL(URL.createObjectURL(newMainImage));
    };
  }, [subImageFiles, newMainImage]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-start text-gray-800 mb-6">Giới thiệu</h2>

      {/* Upload ảnh chính */}
      <div className="mb-6">
        <p className="mb-2">Ảnh chính (Bắt buộc)</p>
        <div className="flex gap-4 flex-wrap">
          {(mainImage || newMainImage) && (
            <div className="relative w-20 h-20">
              <Image
                src={newMainImage ? URL.createObjectURL(newMainImage) : mainImage!}
                alt="Ảnh chính"
                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(newMainImage ? URL.createObjectURL(newMainImage) : mainImage!)}
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveMainImage();
                }}
              >
                ✕
              </button>
            </div>
          )}
          {(!mainImage && !newMainImage) && (
            <label className="w-20 h-20 flex items-center justify-center border rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-gray-500 text-2xl">+</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleMainImageUpload(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Upload ảnh phụ */}
      <div className="mb-6">
        <p className="mb-2">Ảnh phụ (Tối đa 5 ảnh)</p>
        <div className="flex gap-4 flex-wrap">
          {existingSubImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-20 h-20">
              <Image
                src={url}
                alt={`Ảnh phụ hiện có ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(url)}
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveExistingSubImage(index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {subImageFiles.map((file, index) => (
            <div key={`new-${index}`} className="relative w-20 h-20">
              <Image
                src={URL.createObjectURL(file)}
                alt={`Ảnh phụ mới ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(URL.createObjectURL(file))}
              />
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSubImage(index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {(subImageFiles.length + existingSubImages.length) < 5 && (
            <label className="w-20 h-20 flex items-center justify-center border rounded-md cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-gray-500 text-2xl">+</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleSubImageUpload(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="mb-6">
        <p className="mb-2">Nội dung</p>
        <Editor
          content={initialData.content ?? ""}
          onChange={(val) => {
            editorContentRef.current = val;
          }}
        />
      </div>

      {/* Nút submit */}
      <div className="flex justify-end">
        <Button
          color="primary"
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>

      {/* Modal xem trước ảnh */}
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