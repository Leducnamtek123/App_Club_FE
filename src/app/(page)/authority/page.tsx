"use client";

import MemberShipDetailForm from "@/components/ui/authority/DetailForm";
import TableCustomize from "@/components/ui/table_customize";
import { USER_DATA } from "@/tests/authorizeTestData";
import { useState } from "react";

import {
    Button,
    Tooltip,
} from "@heroui/react";
import { MdOutlineEdit } from "react-icons/md";


type User = {
    id: number;
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    joinDate: string; // Có thể dùng Date nếu cần xử lý ngày tháng
    group: string;
    score: number;
    role: "user" | "admin" | "superadmin",
};

export const columns = [
    { name: "id", uid: "id" },
    { name: "Tên", uid: "fullName" },
    { name: "Email", uid: "email" },
    { name: "Sđt", uid: "phone" },
    { name: "địa chỉ", uid: "address" },
    { name: "Ngày gia nhập", uid: "joinDate" },
    { name: "Score", uid: "score" },
    { name: "Actions", uid: "actions" },
] as never;
export const searchBy = ["fullName", "email", "phone"] as never;


export default function Page() {

    const [users, setUsers] = useState(USER_DATA);
    const [selectedData, setSelectedData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const router = useRouter();


    const handleView = (data: any) => {
        setSelectedData(data);
        setIsModalOpen(true);
        console.log(data);
    };


    // cột tinh chỉnh
    const columnsConfig = {
        fullName: (data: any) => (
            <div className="w-32 truncate">
                <p>{data.fullName}</p>
            </div>
        ),
        companyName: (data: any) => (
            <div className="w-40 truncate">
                <p>{data.companyName}</p>
            </div>
        ),
        address: (data: any) => (
            <div className="w-40 truncate">
                <p>{data.address}</p>
            </div>
        ),
        actions: (data: any) => (
            <div className="relative flex justify-center items-center ">

                <Tooltip content="Xem chi tiết">
                    <Button
                        isIconOnly
                        variant="light"
                        color="primary"
                        onPress={() => handleView(data)}
                    >
                        <MdOutlineEdit size={18} />
                    </Button>
                </Tooltip>

            </div>
        ),
    };

    return (
        <section className="flex justify-center z-0">

            {/* Tiêu đề của page */}
            <div className="w-full">
                <div className="mb-10">
                    <p className="font-bold text-2xl">Danh sách hội viên</p>
                </div>

                {/* Hiện bảng */}
                <TableCustomize
                    ariaLabel="authority event"
                    data={users}
                    columns={columns}
                    searchBy={searchBy}
                    columnsConfig={columnsConfig} page={0} totalPages={0} onPageChange={function (page: number): void {
                        throw new Error("Function not implemented.");
                    } }                />

            </div>

            <MemberShipDetailForm
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
            />

        </section>
    );
};