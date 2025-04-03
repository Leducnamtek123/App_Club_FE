"use client";

import NewsForm from "@/components/ui/news/NewsFormDetail";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getNewsById } from "@/services/news/newsServices";
import { CircularProgress } from "@heroui/react";
import { News } from "@/lib/model/type";

export default function Page() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [newsData, setNewsData] = useState<News | null>(null);

  const fetchData = async () => {
    if (newsId) {
      try {
        setIsLoading(true);
        const response = await getNewsById(newsId);
        setNewsData(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [newsId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  const handleSubmit = () => {
    console.log("Submitted news data:", newsData);
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">{newsId ? "Chỉnh sửa tin tức" : "Thêm mới tin tức"}</p>
        </div>
       
        <NewsForm
          newsId={newsId}
          newsData={newsData}
          setNewsData={setNewsData}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}
