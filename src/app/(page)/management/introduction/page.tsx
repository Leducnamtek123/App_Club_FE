"use client";

import IntroductionForm from "@/components/ui/introduction/IntroductionForm";
import { getIntroduction, updateIntroduction } from "@/services/introduction/introductionServices";
import React, { useEffect, useState } from "react";
import { addToast } from "@heroui/react";

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getIntroduction();
      setData(response);
    } catch (error) {
      console.error("Error fetching introduction:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể tải thông tin giới thiệu",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await updateIntroduction(formData);
      setData(response); // Cập nhật lại dữ liệu sau khi submit thành công
      addToast({
        title: "Thành công",
        description: "Cập nhật thông tin giới thiệu thành công",
        color: "success",
      });
    } catch (error) {
      console.error("Error updating introduction:", error);
      addToast({
        title: "Lỗi",
        description: "Cập nhật thông tin giới thiệu thất bại",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="flex justify-center z-0">
      <div className="w-full max-w-4xl">
        <div className="mb-3">
          <p className="font-bold text-2xl">Thông tin giới thiệu</p>
        </div>
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="flex justify-between gap-6">
            <div className="w-1/2">
              <IntroductionForm initialData={data} onSubmit={handleSubmit} />
            </div>
            <div className="w-1/2">
              <div dangerouslySetInnerHTML={{ __html: data?.content || "Chưa có nội dung" }} />
              {data?.mainImage && (
                <img
                  src={data.mainImage}
                  alt="Ảnh chính"
                  className="w-full max-h-64 object-cover rounded-md mt-4"
                />
              )}
              {data?.images && data.images.length > 0 && (
                <div className="mt-4 flex gap-4 flex-wrap">
                  {data.images.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Ảnh phụ ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}