"use client";
import WebSocketComponent from "@/components/ui/WsComponent";
import { EventStatus } from "@/lib/enum/event-status.enum";
import { getBranches } from "@/services/branch/branchServices";
import { getAllEvents } from "@/services/event/eventServices";
import { getSponsorByEventId } from "@/services/event/eventSponsorService";
import {
  Button,
  Card,
  CardBody,
  Chip,
  CircularProgress,
  DatePicker,
  Image,
  Input,
  Link,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const getChipColor = (status) => {
  switch (status) {
    case EventStatus.UPCOMING:
      return "primary";
    case EventStatus.IN_PROGRESS:
      return "success";
    case EventStatus.FINISHED:
      return "danger";
    case EventStatus.CANCELED:
      return "warning";
    default:
      return "default";
  }
};

export default function Page() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;
  const isAdmin = role === "ADMIN";
  const [filters, setFilters] = useState({
    title: "",
    branchId: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    take: 12,
  });
  const [pageCount, setPageCount] = useState(1);
  const [sponsors, setSponsors] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    getBranches()
      .then(setBranchs)
      .catch(() => setBranchs([]));
  }, []);

  const fetchSponsors = async (eventId: string) => {
    try {
      const response = await getSponsorByEventId({ eventId });
      setSponsors((prev) => ({ ...prev, [eventId]: response?.data ?? [] }));
    } catch (error) {
      setSponsors((prev) => ({ ...prev, [eventId]: [] }));
    }
  };

  useEffect(() => {
    events.forEach((event) => {
      if (!sponsors[event.id]) {
        fetchSponsors(event.id);
      }
    });
  }, [events]);

  useEffect(() => {
    setIsLoading(true);
    // Get branchId from localStorage if user is ADMIN
    const userBranchId =
      isAdmin && parsedUser?.branch.id ? parsedUser?.branch?.id : undefined;

    // Combine filters with branchId for ADMIN
    const fetchFilters = isAdmin
      ? { ...filters, branchId: userBranchId }
      : { ...filters };

    getAllEvents(fetchFilters)
      .then((response) => {
        console.log("API response:", response);
        setEvents(response?.data ?? []);
        setPageCount(response?.meta?.pageCount || 1);
      })
      .catch(() => {
        setEvents([]);
        setPageCount(1);
      })
      .finally(() => setIsLoading(false));
  }, [filters, isAdmin, parsedUser?.branch?.id]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDateChange = (key: string, value: any) => {
    if (value) {
      const dateString = value.toDate
        ? value.toDate("UTC").toISOString().split("T")[0]
        : value.toISOString().split("T")[0];
      handleFilterChange(key, dateString);
    } else {
      handleFilterChange(key, undefined);
    }
  };

  const [searchInput, setSearchInput] = useState("");

  const handleInputChange = (value) => {
    setSearchInput(value);
    if (value === "") {
      handleFilterChange("title", "");
    }
  };

  const handleSearch = () => {
    handleFilterChange("title", searchInput);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <div className="mb-3">
          <p className="font-bold text-2xl">Danh sách sự kiện</p>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-end w-full gap-3">
          <div className="flex flex-wrap lg:flex-nowrap gap-5 items-end w-full">
            <div className="flex items-center h-10 w-full min-w-[400px] lg:w-auto rounded-lg overflow-hidden border border-gray-300">
              <Input
                placeholder="Tìm kiếm theo tiêu đề"
                startContent={<FaSearch className="text-gray-500" />}
                value={searchInput}
                radius="none"
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full bg-white border-none focus:ring-0"
                classNames={{ inputWrapper: "bg-white" }}
              />
              <Button
                color="primary"
                onPress={handleSearch}
                className="bg-primary text-white rounded-none px-4"
                isIconOnly
              >
                <FaSearch />
              </Button>
            </div>
            {!isAdmin && (
              <Select
                aria-label="branch"
                variant="bordered"
                placeholder="Chọn chi hội"
                className="bg-white rounded-lg w-1/2/4 min-w-[150px] h-10"
                onChange={(e) => handleFilterChange("branchId", e.target.value)}
              >
                {branchs?.map((branch: any) => (
                  <SelectItem key={branch.id}>{branch.name}</SelectItem>
                ))}
              </Select>
            )}

            <DatePicker
              label="Ngày bắt đầu"
              labelPlacement="outside"
              variant="bordered"
              onChange={(value) => handleDateChange("startDate", value)}
              classNames={{ inputWrapper: "bg-white" }}
              className="w-1/2/4 min-w-[120px]"
            />

            <DatePicker
              label="Ngày kết thúc"
              labelPlacement="outside"
              variant="bordered"
              onChange={(value) => handleDateChange("endDate", value)}
              classNames={{ inputWrapper: "bg-white" }}
              className="w-1/2/4 min-w-[120px]"
            />
          </div>

          <div className="flex justify-center lg:justify-end w-full lg:w-auto mt-4 lg:mt-0">
            <Button
              endContent={<FaPlus />}
              color="primary"
              onPress={() => router.push("/event/form/create")}
              className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
              aria-label="Thêm mới sự kiện"
            >
              Thêm mới sự kiện
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <Spinner size="lg" color="primary" />
            </div>
          ) : events.length > 0 ? (
            events?.map((event) => (
              <Card
                key={event.id}
                className="relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/event/${event.id}`} className="block">
                  <div className="relative">
                    <Carousel
                      showThumbs={false}
                      infiniteLoop
                      autoPlay
                      showStatus={false}
                    >
                      {event.images?.length > 0 ? (
                        event.images.map((img, index) => (
                          <Image
                            key={index}
                            src={img}
                            alt={event.title}
                            className="w-full h-40 object-cover pointer-events-none"
                            width={600}
                            height={200}
                          />
                        ))
                      ) : (
                        <Image
                          src="/default-thumbnail.jpg"
                          alt={event.title}
                          className="w-full h-40 object-cover pointer-events-none"
                          width={600}
                          height={200}
                        />
                      )}
                    </Carousel>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </div>

                  <Chip
                    className="absolute top-2 right-2 z-10 text-xs text-white pointer-events-none"
                    color={getChipColor(event.status)}
                    size="sm"
                  >
                    {event.status}
                  </Chip>

                  <CardBody className="p-3 flex flex-col justify-between">
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-md font-semibold text-gray-800 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex-grow flex flex-col gap-1 text-md text-gray-600">
                        <p className="line-clamp-1">
                          <strong className="text-gray-800">
                            Nhà tổ chức:
                          </strong>{" "}
                          {`Chi hội ${event.branch?.name}` || "Chưa có chi hội"}
                        </p>
                        <p className="line-clamp-1">
                          <strong className="text-gray-800">Thời gian:</strong>{" "}
                          {new Date(event.startDate).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          -{" "}
                          {new Date(event.endDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="line-clamp-1">
                          <strong className="text-gray-800">Địa điểm:</strong>{" "}
                          {event.location}
                        </p>
                        {sponsors[event.id]?.length > 0 ? (
                          <p>
                            <strong>Tổng tài trợ:</strong>{" "}
                            <span className="text-blue-600 font-semibold">
                              {sponsors[event.id]
                                .reduce(
                                  (sum, s) => sum + Number(s.amount || 0),
                                  0
                                )
                                .toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Chưa có nhà tài trợ
                          </p>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Link>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-64">
              Không tìm thấy sự kiện
            </div>
          )}
        </div>

        {events.length > 0 && (
          <div className="flex justify-center mt-5">
            <Pagination
              total={pageCount}
              page={filters.page}
              onChange={handlePageChange}
              showControls
              color="primary"
            />
          </div>
        )}
      </div>
    </section>
  );
}
