"use client"

import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { FaPlus, FaEdit, FaKey } from "react-icons/fa";
import { BiTrash } from "react-icons/bi";
import {
    addToast,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
} from "@heroui/react";
import TableCustomize from "@/components/ui/table_customize";
import ChangePassword from "@/components/ui/membership_leader/ChangePassword";
import { getMembershipLeaders, removeMembershipLeader } from "@/services/membership_leader/membershipLeaderServices";
import CreateMembershipLeader from "@/components/ui/membership_leader/createMembershipLeader";
import FormEditMembershipLeader from "@/components/ui/membership_leader/editMembershilLeader";

const columns = [
    { name: "Chi hội", uid: "branch" },
    { name: "Họ và tên", uid: "name", sortable: true },
    { name: "Công ty", uid: "companyName" },
    { name: "Email", uid: "email" },
    { name: "Số điện thoại", uid: "phone" },
    { name: "Ngày tham gia", uid: "createAt", sortable: true },
    { name: null, uid: "actions" },
];

const searchBy = ["name", "companyName", "email", "phone"];

export default function Page() {
    const [modalState, setModalState] = useState({
        detail: false,
        notification: false,
        fee: false,
        changePassword: false,
        createMembershipLeader: false,
        editMembershipLeader: false,
    });
    const [selectedData, setSelectedData] = useState(null);
    const [membershipLeader, setMembershipLeader] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false); // New state for bulk delete modal

    const [filters, setFilters] = useState({
        search: "",
        branchId: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        take: 10,
    });
    const [meta, setMeta] = useState({
        page: 1,
        take: 10,
        itemCount: 0,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
    });

    useEffect(() => {
        fetchData();
    }, [filters.page, filters.search, filters.branchId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getMembershipLeaders({
                ...filters,
                role: "ADMIN",
            });
            setMembershipLeader(response.data);
            setMeta(response.meta);
        } catch {
            setMembershipLeader([]);
            setMeta({
                page: 1,
                take: 10,
                itemCount: 0,
                pageCount: 1,
                hasPreviousPage: false,
                hasNextPage: false,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (type, data = null) => {
        setSelectedData(data);
        setModalState((prev) => ({ ...prev, [type]: true }));
    };

    const closeModal = () => {
        setSelectedData(null);
        setModalState({
            detail: false,
            notification: false,
            fee: false,
            changePassword: false,
            createMembershipLeader: false,
            editMembershipLeader: false,
        });
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key !== "page" ? 1 : value,
        }));
    };

    const handleSelectionChange = (selectedIds, selectedItems) => {
        setSelectedItems(selectedItems);
        console.log("Selected Items:", selectedItems);
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

    const handleDeleteConfirm = async () => {
        if (!selectedData) return;
        try {
            const response = await removeMembershipLeader(selectedData.id);
            addToast({
                title: "Thành công",
                description: "Xóa chi hội trưởng thành công!",
                color: "success",
                variant: "bordered",
            });
            fetchData();
        } catch (error) {
            addToast({
                title: "Lỗi",
                description: "Xóa chi hội trưởng thất bại!",
                color: "danger",
            });
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedData(null);
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedItems.length > 0) {
            setIsBulkDeleteModalOpen(true);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedItems.length === 0) return;

        try {
            // Use Promise.all to delete all selected items in parallel
            const deletePromises = selectedItems.map(item => 
                removeMembershipLeader(item.id)
            );
            await Promise.all(deletePromises);

            addToast({
                title: "Thành công",
                description: `Đã xóa ${selectedItems.length} chi hội trưởng thành công!`,
                color: "success",
                variant: "bordered",
            });
            fetchData();
            setSelectedItems([]); // Clear selection after deletion
        } catch (error) {
            addToast({
                title: "Lỗi",
                description: "Xóa chi hội trưởng thất bại!",
                color: "danger",
            });
        } finally {
            setIsBulkDeleteModalOpen(false);
        }
    };

    const columnsConfig = {
        branch: (data: any) => <p>{data.branch?.name}</p>,
        name: (data: any) => (
            <div className="flex flex-col w-full overflow-hidden">
                <span className="font-medium">{data.name}</span>
                <span className="text-gray-500 text-sm truncate">{data.position}</span>
            </div>
        ),
        companyName: (data: any) => <p className="truncate w-40">{data.companyName}</p>,
        email: (data: any) => <p className="truncate w-40">{data.email}</p>,
        phone: (data: any) => <p className="truncate w-40">{data.phone}</p>,
        createAt: (data: any) => (
            <p>{new Date(data.createdAt).toLocaleDateString("vi-VN")}</p>
        ),
        actions: (data) => (
            <div className="flex justify-center items-center gap-2">
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly variant="light">
                            <BsThreeDotsVertical size={20} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Actions">
                        <DropdownItem
                            key="edit"
                            startContent={<FaEdit className="text-black" />}
                            onPress={() => openModal("editMembershipLeader", data)}
                        >
                            Chỉnh sửa
                        </DropdownItem>
                        <DropdownItem
                            key="change-password"
                            startContent={<FaKey className="text-black" />}
                            onPress={() => openModal("changePassword", data)}
                        >
                            Đổi mật khẩu
                        </DropdownItem>
                        <DropdownItem
                            key="delete"
                            startContent={<BiTrash />}
                            color="danger"
                            onPress={() => {
                                setSelectedData(data);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            Xóa
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        ),
    };

    return (
        <section className="flex justify-center z-0 w-full">
            <div className="w-full">
                <p className="font-bold text-2xl mb-10">Danh sách chi hội trưởng</p>
                <div className="flex justify-between">
                    <div className="flex gap-5">
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
                    <div className="flex items-center gap-2">
                        <Button
                            color="danger"
                            onPress={handleBulkDeleteClick}
                            isDisabled={selectedItems.length === 0}
                        >
                            Xóa
                        </Button>
                        <Button
                            endContent={<FaPlus />}
                            color="primary"
                            onPress={() => openModal("createMembershipLeader")}
                        >
                            Thêm mới chi hội trưởng
                        </Button>
                    </div>
                </div>
                <TableCustomize
                    ariaLabel="Member List"
                    columns={columns}
                    data={membershipLeader}
                    columnsConfig={columnsConfig}
                    isLoading={isLoading}
                    enableSelection={true}
                    onSelectionChange={handleSelectionChange}
                    page={filters.page}
                    totalPages={meta.pageCount}
                    onPageChange={(page) => handleFilterChange("page", page)}
                />
            </div>

            <ChangePassword
                isModalOpen={modalState.changePassword}
                setIsModalOpen={(open) => setModalState((prev) => ({ ...prev, changePassword: open }))}
                selectedData={selectedData}
                refreshData={fetchData}
            />

            <CreateMembershipLeader
                isModalOpen={modalState.createMembershipLeader}
                setIsModalOpen={(open) => setModalState((prev) => ({ ...prev, createMembershipLeader: open }))}
                refreshData={fetchData}
            />

            <FormEditMembershipLeader
                isModalOpen={modalState.editMembershipLeader}
                setIsModalOpen={(open) => setModalState((prev) => ({ ...prev, editMembershipLeader: open }))}
                selectedData={selectedData}
                refreshData={fetchData}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa chi hội trưởng"
                message="Bạn có chắc chắn muốn xóa chi hội trưởng này không? Hành động này không thể hoàn tác."
                note="Chi hội trưởng sau khi xóa sẽ không thể khôi phục."
                confirmText="Xóa"
                cancelText="Hủy"
                confirmColor="danger"
            />

            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDeleteConfirm}
                title="Xác nhận xóa nhiều chi hội trưởng"
                message={`Bạn có chắc chắn muốn xóa ${selectedItems.length} chi hội trưởng không? Hành động này không thể hoàn tác.`}
                note="Các chi hội trưởng sau khi xóa sẽ không thể khôi phục."
                confirmText="Xóa"
                cancelText="Hủy"
                confirmColor="danger"
            />
        </section>
    );
}