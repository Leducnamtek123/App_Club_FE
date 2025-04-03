"use client";

import TableCustomize from "@/components/ui/table_customize";
import {
  confirmPayment,
  getAllTicketsByEventId,
} from "@/services/ticket/ticketServices";
import { TICKET_DATA } from "@/tests/data";
import {
  addToast,
  Button,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const columns = [
  { name: "Người mua", uid: "name", sortable: true },
  { name: "Ngày mua", uid: "buyDate", sortable: true },
  { name: "Trạng thái", uid: "status", sortable: true },
  { name: "", uid: "actions" },
];

export default function EventTicket() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false); // New state for confirm loading
  const { id } = useParams();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id") || id;
  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    take: 10,
    order: undefined,
    userId: undefined,
    eventId: eventId.toString(),
    status: undefined,
  });
  const [meta, setMeta] = useState({
    page: 1,
    take: 6,
    itemCount: 0,
    pageCount: 1,
  });

  const fetchData = async () => {
    setIsLoading(true);
    getAllTicketsByEventId(filters)
      .then((response) => {
        setData(response?.data ?? []);
        setMeta(response?.meta ?? meta);
      })
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const searchBy = "";

  const handleConfirmPayment = async (ticketData) => {
    if (!ticketData) return;

    try {
      setIsConfirming(true); // Set confirming state to true
      await confirmPayment(ticketData.id);
      // Update the ticket status in the local state
      setData((prevData) =>
        prevData.map((ticket) =>
          ticket.id === ticketData.id ? { ...ticket, status: "VALID" } : ticket
        )
      );
      addToast({
        title: "Thành công",
        description: `Xác nhận thanh toán thành công`,
        variant: "bordered",
        color: "success",
      });
      fetchData();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: `Xác nhận thanh toán thất bại`,
        variant: "bordered",
        color: "success",
      });
    } finally {
      setIsConfirming(false); // Reset confirming state
    }
  };

  const columnsConfig = {
    name: (data) => (
      <div>
        <p>{data.user.name}</p>
      </div>
    ),
    buyDate: (data) => (
      <div>
        <p>{new Date(data.createdAt).toLocaleDateString("vi-VN")}</p>
      </div>
    ),
    status: (data) => (
      <Chip
        className="capitalize font-bold"
        size="sm"
        color={data.status === "VALID" ? "success" : "warning"}
      >
        {data.status === "VALID" ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
      </Chip>
    ),
    actions: (data) => (
      <div className="relative flex justify-center items-center">
        {data.status !== "VALID" && (
          <Popover>
            <PopoverTrigger>
              <Button color="primary" size="sm">
                Xác nhận
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex gap-2 justify-center items-center p-2">
                <span>Bạn có muốn xác nhận?</span>
                <Button
                  size="sm"
                  color="primary"
                  onPress={() => handleConfirmPayment(data)}
                  isLoading={isConfirming} // Show loading state on the button
                  disabled={isConfirming} // Disable button while loading
                >
                  {isConfirming ? "Đang xử lý..." : "Đồng ý"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    ),
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <TableCustomize
          ariaLabel="Member List"
          columns={columns}
          data={data}
          columnsConfig={columnsConfig}
          isLoading={isLoading}
          searchBy={searchBy}
          page={filters.page}
          totalPages={meta?.pageCount}
          onPageChange={(page) => handleFilterChange("page", page)}
        />
      </div>
    </section>
  );
}