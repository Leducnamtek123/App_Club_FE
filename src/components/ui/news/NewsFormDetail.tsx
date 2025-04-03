"use client";

import { useState, useRef } from "react";
import Editor from "@/components/ui/MyEditor";
import {
  Button,
  Form,
  Input,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { News } from "@/lib/model/type";
import { createNews, updateNews } from "@/services/news/newsServices";

export const publishStatus = [
  { key: true, label: "CÔNG KHAI" },
  { key: false, label: "RIÊNG TƯ" },
];

export const categories = [
  { key: "EVENT", label: "SỰ KIỆN" },
  { key: "ANNOUNCEMENT", label: "THÔNG BÁO" },
  { key: "GENERAL", label: "CHUNG" },
];

interface NewsFormProps {
  newsId: string;
  newsData: News;
  setNewsData: (data: News) => void;
  onSubmit: () => void;
}

export default function NewsForm({
  newsData,
  setNewsData,
  onSubmit,
  newsId,
}: NewsFormProps) {
  const editorContentRef = useRef(newsData?.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const validateField = (name: string, value: string | File | null) => {
    const newErrors = { ...errors };

    if (!value) {
      switch (name) {
        case "title":
          newErrors.title = "Tiêu đề tin tức không được để trống";
          break;
        case "category":
          newErrors.category = "Danh mục không được để trống";
          break;
        case "thumbnail":
          if (!newsId) newErrors.thumbnail = "Vui lòng chọn ảnh bìa"; // Chỉ yêu cầu thumbnail khi tạo mới
          break;
      }
    } else {
      delete newErrors[name];
    }

    if (name === "content" && !editorContentRef.current) {
      newErrors.content = "Nội dung tin tức không được để trống";
    } else if (name === "content" && editorContentRef.current) {
      delete newErrors.content;
    }

    setErrors(newErrors);
  };

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};

    if (!formData.get("title"))
      newErrors.title = "Tiêu đề tin tức không được để trống";
    if (!formData.get("category"))
      newErrors.category = "Danh mục không được để trống";
    if (!newsId && !imageFile && !newsData.thumbnail)
      newErrors.thumbnail = "Vui lòng chọn ảnh bìa";
    if (!editorContentRef.current)
      newErrors.content = "Nội dung tin tức không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const stripHtmlTags = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleFieldChange = (name: string, value: string | null) => {
    let finalValue = value;
    if (name === "title" && value) {
      finalValue = stripHtmlTags(value);
    }
    validateField(name, finalValue);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setImageFile(file); // Lưu file gốc để gửi lên server
    setNewsData({ ...newsData, thumbnail: URL.createObjectURL(file) }); // Hiển thị preview
    validateField("thumbnail", file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isValid = validateForm(formData);

    if (!isValid) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ các trường bắt buộc",
        color: "danger",
        classNames: { base: "z-3" },
      });
      return;
    }

    setIsLoading(true);

    const title = stripHtmlTags(formData.get("title") as string);
    const content = editorContentRef.current;
    const isPublished = formData.get("isPublished") === "true";
    const category = formData.get("category") as string;

    const apiFormData = new FormData();
    apiFormData.append("title", title);
    apiFormData.append("content", content);
    apiFormData.append("isPublished", isPublished.toString());
    apiFormData.append("category", category);
    if (imageFile) {
      apiFormData.append("thumbnail", imageFile); // Gửi file gốc nếu có
    } else if (!newsId && !newsData.thumbnail) {
      // Kiểm tra trường hợp tạo mới mà không có ảnh
      setErrors({ thumbnail: "Vui lòng chọn ảnh bìa" });
      setIsLoading(false);
      return;
    }

    try {
      if (newsId) {
        await updateNews(newsId, apiFormData);
        addToast({
          title: "Thành công",
          description: "Cập nhật tin tức thành công",
          color: "success",
          classNames: { base: "z-3" },
        });
      } else {
        await createNews(apiFormData);
        addToast({
          title: "Thành công",
          description: "Thêm tin tức thành công",
          color: "success",
          classNames: { base: "z-3" },
        });
      }
      onSubmit();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: `Có lỗi khi ${newsId ? "cập nhật" : "thêm"} tin tức`,
        color: "danger",
        classNames: { base: "z-3" },
      });
      console.error(`Error ${newsId ? "updating" : "submitting"} news:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-2/4 bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
      <div className="mb-5 font-bold">Chi tiết tin tức</div>
      <Form onSubmit={handleSubmit}>
        <div className="w-full">
          <Input
            name="title"
            label="Tiêu đề tin tức"
            size="lg"
            labelPlacement="outside"
            placeholder="Nhập tiêu đề tin tức"
            variant="bordered"
            defaultValue={newsData?.title}
            errorMessage={errors.title}
            isInvalid={!!errors.title}
            onChange={(e) => {
              setNewsData({ ...newsData, title: e.target.value });
              handleFieldChange("title", e.target.value);
            }}
          />
          <div className="grid grid-cols-2 gap-10 mt-10">
            <Select
              name="isPublished"
              label="Trạng thái công khai"
              size="lg"
              labelPlacement="outside"
              variant="bordered"
              placeholder="Chọn trạng thái"
              defaultSelectedKeys={["false"]}
              isDisabled={newsId ? false : true}
              onChange={(e) => {
                const isPublished = e.target.value === "true";
                setNewsData({ ...newsData, isPublished });
                handleFieldChange("isPublished", e.target.value);
              }}
            >
              {publishStatus.map((status) => (
                <SelectItem key={status.key.toString()}>
                  {status.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              name="category"
              label="Danh mục"
              size="lg"
              labelPlacement="outside"
              variant="bordered"
              placeholder="Chọn danh mục"
              defaultSelectedKeys={
                newsData?.category ? [newsData.category] : []
              }
              errorMessage={errors.category}
              isInvalid={!!errors.category}
              onChange={(e) => {
                setNewsData({ ...newsData, category: e.target.value });
                handleFieldChange("category", e.target.value);
              }}
            >
              {categories.map((cat) => (
                <SelectItem key={cat.key}>{cat.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="mt-10">
            <Input
              name="thumbnail"
              type="file"
              size="lg"
              variant="bordered"
              label="Chọn ảnh bìa"
              labelPlacement="outside"
              onChange={(e) => handleImageUpload(e.target.files)}
              errorMessage={errors.thumbnail}
              isInvalid={!!errors.thumbnail}
            //disabled={!!newsId} // Disable file input khi cập nhật
            />
            {newsData?.thumbnail && (
              <div className="mt-3">
                <img
                  src={newsData?.thumbnail}
                  alt="Ảnh bìa"
                  className="w-20 h-20 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
          <div className="mt-10">
            <p className="mb-2">Nội dung tin tức</p>
            <Editor
              content={newsData?.content}
              onChange={(val) => {
                editorContentRef.current = val;
                setNewsData({ ...newsData, content: val });
                handleFieldChange("content", val);
              }}
            />
            {errors.content && (
              <p className="text-danger text-sm mt-1">{errors.content}</p>
            )}
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="bordered" disabled={isLoading}>
              Hủy
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : newsId ? "Cập nhật" : "Xác nhận"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}