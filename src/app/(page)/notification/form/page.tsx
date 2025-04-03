"use client";

import { NOTIF_DATA } from "@/tests/data";
import {
  Button,
  Form,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Notification = {
  id: number;
  title: string;
  content: string;
  date: string;
  type: "info" | "error" | "success" | "warning";
  status: "active" | "expired";
  targetAudience: string[];
};

export const type = [
  { key: "info", label: "Thông tin" },
  { key: "error", label: "Lỗi" },
  { key: "success", label: "Thành công" },
  { key: "warning", label: "Cảnh báo" },
];

export const targetAudience = [
  { key: "members", label: "Hội viên" },
  { key: "vip_members", label: "Thành viên VIP" },
  { key: "all_users", label: "Tất cả mọi người" },
  { key: "sponsor", label: "Nhà tài trợ" },
];

// Component chứa logic chính
function NotificationFormContent() {
  const searchParams = useSearchParams();
  const notifId = searchParams.get("id");
  const [notifData, setNotifData] = useState<Notification>({
    id: 0,
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // Ngày hiện tại mặc định
    type: "info",
    status: "active",
    targetAudience: [],
  });

  useEffect(() => {
    if (notifId) {
      const foundNotif = NOTIF_DATA.find((e) => e.id.toString() === notifId);
      if (foundNotif) {
       // setNotifData(foundNotif as Notification);
      }
    }
  }, [notifId]);

  const handleSubmit = () => {
    console.log("Dữ liệu thông báo:", notifData);
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">Thông tin thông báo</p> {/* Sửa tiêu đề */}
        </div>
        <div>
          <Form>
            <div className="w-3/5 bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
              <Input
                label="Tiêu đề"
                size="lg"
                labelPlacement="outside"
                placeholder="VD: Thông báo..."
                variant="bordered"
                value={notifData.title}
                onChange={(e) =>
                  setNotifData({ ...notifData, title: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-10 mt-10">
                <Select
                  label="Loại thông báo"
                  labelPlacement="outside"
                  size="lg"
                  placeholder="Chọn loại thông báo"
                  variant="bordered"
                  selectedKeys={
                    notifData.type ? new Set([notifData.type]) : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const selectedValue = Array.from(keys)[0];
                    if (
                      ["info", "error", "success", "warning"].includes(
                        selectedValue as string
                      )
                    ) {
                      setNotifData({
                        ...notifData,
                        type: selectedValue as Notification["type"],
                      });
                    }
                  }}
                >
                  {type.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Đối tượng"
                  labelPlacement="outside"
                  size="lg"
                  placeholder="Chọn đối tượng"
                  variant="bordered"
                  isMultiline={true}
                  selectionMode="multiple"
                  selectedKeys={new Set(notifData.targetAudience)}
                  onSelectionChange={(keys) => {
                    setNotifData({
                      ...notifData,
                      targetAudience: Array.from(keys) as string[],
                    });
                  }}
                >
                  {targetAudience.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
              </div>
              <Textarea
                label="Nội dung"
                size="lg"
                labelPlacement="outside"
                placeholder="Nhập nội dung thông báo..."
                variant="bordered"
                value={notifData.content} // Sửa từ title thành content
                onChange={(e) =>
                  setNotifData({ ...notifData, content: e.target.value }) // Sửa từ title thành content
                }
                className="mt-10"
              />
              <div className="mt-5 flex justify-end gap-3">
                <Button variant="bordered">Hủy</Button>
                <Button color="primary" onPress={handleSubmit}>
                  Xác nhận
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
}

// Component chính bọc trong Suspense
export default function NotificationFormPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Đang tải...</div>}>
      <NotificationFormContent />
    </Suspense>
  );
}