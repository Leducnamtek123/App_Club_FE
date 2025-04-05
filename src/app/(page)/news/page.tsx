"use client";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { deleteNews, getAllNews } from "@/services/news/newsServices";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  Pagination,
  Skeleton,
  CardFooter,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEllipsisV, FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";

export const publishStatus = [
  { key: true, label: "CÔNG KHAI" },
  { key: false, label: "RIÊNG TƯ" },
];
export const categories = [
  { key: "EVENT", label: "SỰ KIỆN" },
  { key: "ANNOUNCEMENT", label: "THÔNG BÁO" },
  { key: "GENERAL", label: "CHUNG" },
];

export default function Page() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);

  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;
  const isAdmin = role === "ADMIN";

  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    take: 6,
    isPublished: undefined,
    category: undefined,
    branchId: undefined, // Added branchId to filters
  });

  const [meta, setMeta] = useState({
    page: 1,
    take: 6,
    itemCount: 0,
    pageCount: 1,
  });

  const fetchNews = () => {
    setIsLoading(true);
    // Get branchId from localStorage if user is ADMIN
    const userBranchId = isAdmin && parsedUser?.branch?.id ? parsedUser?.branch?.id : undefined;
    
    // Combine filters with branchId for ADMIN
    const fetchFilters = isAdmin 
      ? { ...filters, branchId: userBranchId }
      : { ...filters };

    getAllNews(fetchFilters)
      .then((response) => {
        setData(response?.data ?? []);
        setMeta(response?.meta ?? meta);
      })
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, [filters, isAdmin, parsedUser?.branch?.id]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleDeleteClick = (newsId) => {
    setSelectedNewsId(newsId);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNewsId) return;

    setDeletingIds((prev) => [...prev, selectedNewsId]);
    try {
      await deleteNews(selectedNewsId);
      addToast({
        title: "Thành công",
        description: "Xóa tin tức thành công!",
        color: "success",
      });
      fetchNews();
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể xóa tin tức.",
        color: "danger",
      });
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== selectedNewsId));
      setSelectedNewsId(null);
    }
  };

  const handleInputChange = (value) => {
    setSearchInput(value);
    if (value === "") {
      handleFilterChange("q", "");
    }
  };

  const handleSearch = () => {
    handleFilterChange("q", searchInput);
  };

  return (
    <section className="flex flex-col items-center z-0 px-4">
      <div className="w-full">
        <div className="mb-10 flex justify-between items-center">
          <p className="font-bold text-2xl">Danh sách tin tức</p>
        </div>

        <div className="div">
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <div className="flex items-center h-10 w-full lg:w-auto rounded-lg overflow-hidden border border-gray-300">
                <Input
                  placeholder="Tìm kiếm"
                  startContent={<FaSearch className="text-gray-500" />}
                  value={searchInput}
                  radius="none"
                  onChange={(e) => handleInputChange(e.target.value)}
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
            </div>
            <div className="flex justify-items-end gap-4">
              <Select
                aria-label="status"
                variant="bordered"
                placeholder="Trạng thái đăng"
                className="w-40 bg-white rounded-large"
                onChange={(e) =>
                  handleFilterChange("isPublished", e.target.value)
                }
              >
                {publishStatus.map((status: any) => (
                  <SelectItem key={status.key}>{status.label}</SelectItem>
                ))}
              </Select>

              <Select
                aria-label="type"
                variant="bordered"
                placeholder="Loại"
                className="w-40 bg-white rounded-large"
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                {categories.map((status: any) => (
                  <SelectItem key={status.key}>{status.label}</SelectItem>
                ))}
              </Select>

              <Button
                endContent={<FaPlus />}
                color="primary"
                onPress={() => router.push("/news/form")}
              >
                Thêm mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 w-full mt-5">
          {[...Array(2)].map((_, index) => (
            <Card
              key={index}
              className="shadow-md rounded-lg overflow-hidden w-full min-h-[32px]"
            >
              <Skeleton className="w-full h-12 rounded-t-lg" />
              <CardBody className="p-4">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 w-full mt-5">
          {data.map((item) => (
            <Card
              key={item.id}
              className="shadow-lg rounded-xl flex flex-row p-4 w-full min-h-[150px] relative"
            >
              <div className="absolute top-2 right-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly variant="light" color="primary">
                      <FaEllipsisV />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    onAction={(key) =>
                      key === "delete"
                        ? handleDeleteClick(item.id)
                        : router.push(`/news/form?id=${item.id}`)
                    }
                  >
                    <DropdownItem key="edit" startContent={<FaEdit />}>
                      Chỉnh sửa
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      startContent={<FaTrash />}
                      color="danger"
                    >
                      Xóa
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <Link
                href={`/news/form?id=${item.id}`}
                className="flex flex-row w-full"
              >
                <img
                  src={item.thumbnail || "/default-image.jpg"}
                  alt={item.title}
                  className="w-64 h-48 object-cover rounded-lg"
                />
                <CardBody className="px-4 w-full flex flex-col justify-between overflow-hidden">
                  <h3 className="font-semibold text-lg mb-2 w-full line-clamp-5 hover:underline decoration-primary-500">
                    {item.title}
                  </h3>
                  <div className="flex justify-between">
                    <div className="flex items-end">
                      <p className="text-gray-400 text-sm">Ngày đăng: {new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="flex gap-5 justify-end md:gap-2 md:justify-end flex-wrap">
                      <Chip
                        size="sm"
                        variant="bordered"
                        color={
                          item.category === "EVENT"
                            ? "warning"
                            : item.category === "GENERAL"
                            ? "primary"
                            : "danger"
                        }
                        className=""
                      >
                        {item.category === "EVENT"
                          ? "Sự kiện"
                          : item.category === "GENERAL"
                          ? "Chung"
                          : "Thông báo"}
                      </Chip>
                      <Chip
                        size="sm"
                        color={item.isPublished ? "primary" : "danger"}
                      >
                        {item.isPublished ? "Đã đăng" : "Chưa đăng"}
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Link>
            </Card>
          ))}
        </div>
      )}
      <Pagination
        isCompact
        showControls
        page={meta.page}
        total={meta.pageCount}
        onChange={(page) => handleFilterChange("page", page)}
        className="mt-5"
      />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa tin tức"
        message="Bạn có chắc chắn muốn xóa tin tức này không? Hành động này không thể hoàn tác."
        note="Tin tức sau khi xóa sẽ không thể khôi phục."
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="danger"
      />
    </section>
  );
}