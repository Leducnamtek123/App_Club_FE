"use client";

import TableCustomize from "@/components/ui/table_customize";
import { NOTIF_DATA } from "@/tests/data";
import {
  Button,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaCheckCircle, FaInfoCircle, FaPlus } from "react-icons/fa";
import { MdDangerous, MdOutlineEdit } from "react-icons/md";
import { PiWarningFill } from "react-icons/pi";

type Notification = {
  id: number; // Số nguyên (int)
  title: string; // Chuỗi (string)
  content: string; // Chuỗi (string)
  date: string; // Chuỗi ngày (YYYY-MM-DD)
  type: "info" | "error" | "success" | "warning"; // Enum (chuỗi cố định)
  status: "active" | "expired"; // Enum (chuỗi cố định)
};

export const columns = [
  { name: "Tiêu đề", uid: "title", sortable: true },
  { name: "Nội dung", uid: "content" },
  { name: "Loại", uid: "type", sortable: true },
  { name: "Ngày tạo", uid: "createdAt", sortable: true },
  { name: "Đối tượng nhận", uid: "targetAudience", sortable: false },
  { name: "Trạng thái", uid: "status", sortable: true },
  { name: "Actions", uid: "actions" }, // Cột cho nút sửa, xóa
];

const statusColorMap = {
  active: "success", // Thông báo đang hoạt động
  expired: "danger", // Thông báo đã hết hạn
};
const typeColorMap = {
  info: "primary", // Thông báo chung
  warning: "warning", // Cảnh báo
  error: "danger", // Lỗi hoặc sự cố
  success: "success", // Thông báo thành công
};

const typeIcons = {
  info: <FaInfoCircle />,
  warning: <PiWarningFill />, // Cảnh báo
  error: <MdDangerous />, // Lỗi hoặc sự cố
  success: <FaCheckCircle />, // Thông báo thành công
};

const searchBy = ["title", "type", "createdAt", "status", "targetAudience"];

export default function Page() {
  const router = useRouter();
  const columnsConfig = {
    targetAudience: (data: any) => (
      <div className="flex flex-wrap gap-2">
        {data.targetAudience.map((audience: any) => (
          <p key={audience}>{audience}</p>
        ))}
      </div>
    ),
    status: (data: Notification) => (
      <Chip
        variant="shadow"
        className="capitalize"
        color={statusColorMap[data.status] as "success" | "danger"}
        size="sm"
      >
        {data.status}
      </Chip>
    ),
    type: (data: Notification) => (
      <div className="flex right-5">
        <Chip
          variant="bordered"
          className="capitalize"
          color={
            typeColorMap[data.type] as
              | "success"
              | "danger"
              | "warning"
              | "primary"
          }
          size="md"
          startContent={typeIcons[data.type]}
        >
          {data.type}
        </Chip>
      </div>
    ),
    actions: (data: any) => (
      <div className="relative flex justify-center items-center h-9">
        <Tooltip content="Xem chi tiết" placement="left">
          <Button
            isIconOnly
            variant="light"
            color="primary"
            onPress={() => router.push(`/notification/form?id=${data.id}`)}
          >
            <MdOutlineEdit size={18} />
          </Button>
        </Tooltip>

        <Popover>
          <PopoverTrigger>
            <Button isIconOnly variant="light" color="danger">
              <BiTrash size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="gap-2 flex text-sm my-1 justify-center items-center">
              <div>Bạn có muốn xóa?</div>
              <Button
                size="sm"
                color="danger"
                onPress={() => {
                  //  handleDelete(data.id);
                }}
              >
                Đồng ý
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
  };

  const [notifs, setNotifs] = useState(NOTIF_DATA);
  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">Danh sách thông báo</p>
        </div>
        <TableCustomize
          ariaLabel="Event list"
          data={notifs}
          columns={columns}
          columnsConfig={columnsConfig}
          //searchBy={searchBy}
          formModal={
            <Button
              endContent={<FaPlus />}
              color="primary"
              onPress={() => router.push("/notification/form")}
            >
              Thêm mới thông báo
            </Button>
          }
        />
      </div>
    </section>
  );
}
