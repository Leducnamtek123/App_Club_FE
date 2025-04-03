"use client";

import IntroductionForm from "@/components/ui/introduction/IntroductionForm";
import {
  getIntroduction,
  updateIntroduction,
} from "@/services/introduction/introductionServices";
import React, { useEffect, useState } from "react";
import { addToast } from "@heroui/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline"; // Sử dụng icon từ Heroicons

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
      setData(response);
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
    <section className="min-h-screen w-full ">
      <div className="container mx-auto px-4 ">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Thông tin giới thiệu
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600 py-10">
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <IntroductionForm initialData={data} onSubmit={handleSubmit} />
            </div>

            {/* Preview section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              {data?.mainImage && (
                <div className="mt-6">
                  <img
                    src={data.mainImage}
                    alt="Ảnh chính"
                    className="w-full max-h-80 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>
              )}

              {data?.images && data.images.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {data.images.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Ảnh phụ ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-md shadow-sm hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              )}
              <div className="prose prose-indigo max-w-none text-gray-800 mt-5">
                <div
                  dangerouslySetInnerHTML={{
                    __html: data?.content || "Chưa có nội dung",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
