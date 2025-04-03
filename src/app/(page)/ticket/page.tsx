"use client";

import TableCustomize from "@/components/ui/table_customize";
import { TICKET_DATA } from "@/tests/data";
import {
  Button,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useState } from "react";

const columns = [
  { name: "Người mua", uid: "nguoi_mua", sortable: true },
  { name: "Sự kiện", uid: "su_kien", sortable: true },
  { name: "Ngày diễn ra", uid: "ngay_dien_ra", sortable: true },
  { name: "Loại vé", uid: "loai_ve", sortable: true },
  { name: "Giá tiền", uid: "gia_tien", sortable: true },
  { name: "Trạng thái", uid: "trang_thai", sortable: true },
  { name: "Actions", uid: "actions" },
];

export default function Page() {
  const [data, setData] = useState(TICKET_DATA);

  const searchBy = [""];

  const columnsConfig = {
    trang_thai: (data: any) => (
      <Chip
        className="capitalize"
        size="sm"
        color={data.trang_thai === "Đã thanh toán" ? "success" : "warning"}
      >
        {data.trang_thai}
      </Chip>
    ),
    actions: (data: any) => (
      <div className="relative flex justify-center items-center ">
        <Popover>
          <PopoverTrigger>
            <Button
              color="primary"
              size="sm"
              //onPress={() => openSendNotifView(data)}
            >
              Xác nhận
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex gap-2 justify-center items-center">
              Bạn có muốn xác nhận? 
              <Button size="sm" color="primary">
                Đồng ý 
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">Danh sách vé</p>
        </div>
        <TableCustomize
          ariaLabel="Member List"
          columns={columns}
          data={data}
          columnsConfig={columnsConfig}
          searchBy={searchBy}
        />
      </div>
    </section>
  );
}
