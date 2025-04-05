"use client";

import FeeForm from "@/components/ui/membership/FeeForm";
import FeeReminderNotif from "@/components/ui/membership/FeeReminderNotif";
import { getBranches } from "@/services/branch/branchServices";
import { getAllMemberFee } from "@/services/membership/membershipServices";
import { getMembershipFee } from "@/services/membership_fee/membershipFeeServices";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { Table } from "antd";
import { createStyles } from "antd-style";
import "antd/dist/reset.css";
import { useEffect, useMemo, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaCheck, FaSearch, FaTimes } from "react-icons/fa";

const useStyle = createStyles(({ css }) => {
  return {
    customTable: css`
      .ant-table {
        .ant-table-container {
          .ant-table-body,
          .ant-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

const generateYearColumns = (years, openAddFee, openNotification) => {
  return [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      sorter: true,
      align: "center",
      width: 200,
      fixed: "left",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      width: 150,
      fixed: "left",
    },
    {
      title: "Chi hội",
      dataIndex: "branch",
      key: "branch",
      sorter: true,
      align: "center",
      width: 150,
      fixed: "left",
    },
    ...years.map((year) => ({
      title: `${year}`,
      dataIndex: `fees_${year}`,
      key: `year_${year}`,
      align: "center",
      width: 100,
      render: (text) => (
        <Chip
          variant="shadow"
          size="sm"
          color={text === "Đã đóng" ? "success" : "warning"}
        >
          {text === "Đã đóng" ? <FaCheck /> : <FaTimes />}
        </Chip>
      ),
    })),
    {
      title: "",
      key: "actions",
      align: "center",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <BiDotsVerticalRounded size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Actions">
            <DropdownItem key="view" onClick={() => openAddFee(record)}>
              Xem chi tiết
            </DropdownItem>
            <DropdownItem key="notify" onClick={() => openNotification(record)}>
              Nhắc đóng phí
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];
};

const transformFeeData = (feeData, years) => {
  const userMap = new Map();
  feeData.forEach(({ user, payments }) => {
    if (!userMap.has(user.id)) {
      userMap.set(user.id, {
        id: user.id,
        name: user.name,
        phone: user.phone,
        branch: user.branch?.name || "Chưa xác định",
        ...Object.fromEntries(years.map((y) => [`fees_${y}`, "Chưa tham gia"])),
      });
    }
    payments.forEach(({ year, status }) => {
      if (years.includes(year)) {
        userMap.get(user.id)[`fees_${year}`] =
          status === 1 ? "Đã đóng" : "Chưa đóng";
      }
    });
  });
  return Array.from(userMap.values());
};

export default function FeeHistoryPage() {
  const { styles } = useStyle();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [allYears, setAllYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>([]));
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;
  const isAdmin = role === "ADMIN";

  const [filters, setFilters] = useState({
    q: "",
    page: 1,
    take: 10,
    branchId: undefined,
    order: undefined,
    startYear: undefined,
    endYear: undefined,
    userId: undefined,
  });
  const [meta, setMeta] = useState({
    page: 1,
    take: 10,
    itemCount: 0,
    pageCount: 1,
  });

  const fetchFeeData = async () => {
    setIsLoading(true);
    try {
      const data = await getMembershipFee();
      const years = [...new Set(data?.map(({ year }) => year))].sort();
      setAllYears(years);
      setFilteredYears(years);
    } catch (error) {
      console.error("Error fetching fee data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    if (!filteredYears.length) return;
    setIsLoading(true);
    try {
      const res = await getAllMemberFee(filters);
      setMeta(res.meta);
      const transformedData = transformFeeData(res.data, filteredYears);
      setData(transformedData);
    } catch (error) {
      addToast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu phí hội viên.",
        variant: "solid",
        color: "danger",
      });
      console.error("Error fetching member fee data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBranches().then(setBranchs).catch(console.error);
  }, []);

  useEffect(() => {
    fetchFeeData();
  }, []);

  useEffect(() => {
    let yearsToShow = [...allYears];
    if (filters.startYear || filters.endYear) {
      const start = filters.startYear ?? Math.min(...allYears);
      const end = filters.endYear ?? Math.max(...allYears);
      yearsToShow = yearsToShow.filter((y) => y >= start && y <= end);
    }
    setFilteredYears(yearsToShow);
  }, [filters.startYear, filters.endYear, allYears]);

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.q, filters.branchId, filteredYears]);

  const openAddFee = (data) => {
    setSelectedData(data);
    setIsFeeModalOpen(true);
  };

  const openNotification = (data) => {
    setSelectedData([data]);
    setIsNotificationModalOpen(true);
  };

  const handleFeeAdded = () => {
    fetchData();
    fetchFeeData();
  };

  const handleFilterChange = (key, value) => {
    const newValue = value || undefined;

    if (key === "startYear" && newValue && filters.endYear) {
      if (parseInt(newValue) > parseInt(filters.endYear)) {
        addToast({
          title: "Lỗi",
          description: "Năm bắt đầu không được lớn hơn năm kết thúc.",
          variant: "solid",
          color: "danger",
        });
        return;
      }
    }
    if (key === "endYear" && newValue && filters.startYear) {
      if (parseInt(newValue) < parseInt(filters.startYear)) {
        addToast({
          title: "Lỗi",
          description: "Năm kết thúc không được nhỏ hơn năm bắt đầu.",
          variant: "solid",
          color: "danger",
        });
        return;
      }
    }

    setFilters((prev) => ({
      ...prev,
      [key]: newValue,
      page: key !== "page" ? 1 : newValue,
    }));
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

  const handleNotificationWithSelection = () => {
    const selectedItems = data.filter((item) =>
      isAllSelected ? true : selectedKeys.has(item.id)
    );
    if (selectedItems.length === 0) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một hội viên để gửi thông báo",
        variant: "solid",
        color: "danger",
      });
      return;
    }
    setSelectedData(selectedItems);
    setIsNotificationModalOpen(true);
  };

  const isSelectionEmpty = () => {
    return isAllSelected ? false : selectedKeys.size === 0;
  };

  const columns = useMemo(
    () => generateYearColumns(filteredYears, openAddFee, openNotification),
    [filteredYears]
  );

  const rowSelection = {
    selectedRowKeys: Array.from(selectedKeys),
    onChange: (selectedRowKeys) => {
      const newSelectedKeys = new Set<string>(selectedRowKeys);
      const allSelected =
        selectedRowKeys.length === data.length && data.length > 0;
      setIsAllSelected(allSelected);
      setSelectedKeys(newSelectedKeys);
    },
  };

  return (
    <section className="">
      <div className="max-w-[1500px]">
        <p className="font-bold text-2xl mb-10">Lịch sử hội phí</p>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
          <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full">
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
            {!isAdmin && (
              <Select
                aria-label="select"
                variant="bordered"
                placeholder="Chọn chi hội"
                className="w-full lg:w-40 min-w-[180px]"
                classNames={{ mainWrapper: "bg-white rounded-large" }}
                onChange={(e) => handleFilterChange("branchId", e.target.value)}
              >
                {branchs?.map((branch: any) => (
                  <SelectItem key={branch.id}>{branch.name}</SelectItem>
                ))}
              </Select>
            )}
            <Select
              aria-label="startYear"
              placeholder="Năm bắt đầu"
              variant="bordered"
              className="w-full lg:w-40 min-w-[180px]"
              selectedKeys={
                filters.startYear ? [String(filters.startYear)] : []
              }
              style={{ backgroundColor: "white" }}
              onChange={(e) => handleFilterChange("startYear", e.target.value)}
            >
              {allYears?.map((y) => (
                <SelectItem
                  key={String(y)}
                  textValue={String(y)}
                  isDisabled={filters.endYear && y > parseInt(filters.endYear)}
                >
                  {y}
                </SelectItem>
              ))}
            </Select>
            <Select
              aria-label="endYear"
              placeholder="Năm kết thúc"
              variant="bordered"
              className="w-full lg:w-40 min-w-[180px]"
              selectedKeys={filters.endYear ? [String(filters.endYear)] : []}
              style={{ backgroundColor: "white" }}
              onChange={(e) => handleFilterChange("endYear", e.target.value)}
            >
              {allYears?.map((y) => (
                <SelectItem
                  key={String(y)}
                  textValue={String(y)}
                  isDisabled={
                    filters.startYear && y < parseInt(filters.startYear)
                  }
                >
                  {y}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <Button
              variant={isSelectionEmpty() ? "bordered" : "solid"}
              color={isSelectionEmpty() ? "default" : "primary"}
              onPress={handleNotificationWithSelection}
              disabled={isSelectionEmpty()}
            >
              Nhắc đóng phí
            </Button>
          </div>
        </div>
        <div className="w-full border border-gray-200 rounded-lg shadow-sm">
          <Table
            rowKey="id"
            className={styles.customTable}
            columns={columns}
            dataSource={data}
            loading={isLoading}
            rowSelection={rowSelection}
            pagination={false}
            scroll={{ x: 5 * 100 + 200 + 150 + 150 + 80 }}
            bordered
          />
        </div>
      </div>
      <FeeReminderNotif
        isModalOpen={isNotificationModalOpen}
        setIsModalOpen={setIsNotificationModalOpen}
        selectedData={selectedData}
        allYears={allYears}
      />
      <FeeForm
        isModalOpen={isFeeModalOpen}
        setIsModalOpen={setIsFeeModalOpen}
        selectedData={selectedData}
        isFullView={false}
      />
    </section>
  );
}