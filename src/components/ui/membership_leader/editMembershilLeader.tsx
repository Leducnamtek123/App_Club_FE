"use client"

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    addToast,
    Select,
    SelectItem,
} from "@heroui/react";
import { Autocomplete, AutocompleteSection, AutocompleteItem } from "@heroui/autocomplete";
import { useEffect, useState } from "react";
import { editMembershipLeader } from "@/services/membership_leader/membershipLeaderServices";
import { getBranches } from "@/services/branch/branchServices";
import { useCallback, useMemo } from "react";


export const salutations = [
    { key: "Anh", label: "Anh" },
    { key: "Chị", label: "Chị" },
];

export const positions = [
    { key: "Giám đốc điều hành", label: "Giám đốc điều hành" },
    { key: "Giám đốc vận hành", label: "Giám đốc vận hành" },
];

export default function FormEditMembershipLeader({
    isModalOpen,
    setIsModalOpen,
    refreshData,
    selectedData
}: {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    refreshData: () => void;
    selectedData: any | null;
}) {

    console.log("Selected Data:: ", selectedData);

    const [membershipId, setMembershipId] = useState("")
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    // const [address, setAddress] = useState("");
    const [branchId, setBranchId] = useState("");
    const [salutation, setSalutation] = useState("")
    const [position, setPosition] = useState("");

    // const [img, setImg] = useState(null);
    const [branches, setBranches] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const handleImageChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         setImg(URL.createObjectURL(file));
    //     }
    // };

    const fetchData = async () => {
        try {
            const branches = await getBranches();
            setIsLoading(true);
            if (branches) {
                setBranches(branches);
            } else {
                console.log("Error fetching branches");
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle get data from API
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedData) {
            setMembershipId(selectedData.id || "")
            setName(selectedData.name || "");
            setPhone(selectedData.phone || "");
            setEmail(selectedData.email || "");
            setCompanyName(selectedData.companyName || "");
            // setAddress(selectedData.address || "");
            setBranchId(selectedData.branch.id || "");
            setSalutation(selectedData.salutation || "");
            setPosition(selectedData.position || "");
        }
    }, [selectedData]);


    const handleClose = (open: boolean) => {
        setIsModalOpen(open);
    };

    const handleUpdate = async () => {

        if (!name.trim() || !phone.trim() || !email.trim() || !branchId) {
            addToast({
                title: "Lỗi",
                description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
                variant: "solid",
                color: "danger",
            });
            return;
        }

        if (phone.length !== 10) {
            addToast({
                title: "Lỗi",
                description: "Số điện thoại phải có đúng 10 chữ số.",
                variant: "solid",
                color: "danger",
            });
            return;
        }

        const payload = {
            name: name,
            phone: phone,
            zaloPhone: phone,
            email: email,
            companyName: companyName,
            // address: address,
            branchId: branchId,
            position: position,
            role: "ADMIN",
            // avatar: img
        };
        setIsSubmitting(true);
        try {
            await editMembershipLeader(payload, membershipId);
            addToast({
                title: "Thành công",
                description: "Cập nhât chi hội trưởng thành công.",
                color: "success",
            });
            setIsModalOpen(false);
            refreshData();
        } catch (error) {
            const errorMessage = error.response?.data?.message;
            if (error.response?.status === 400) {
                if (errorMessage === "Only approved users can be updated") {
                    addToast({
                        title: "Lỗi",
                        description: "Bạn phải xét duyệt chi hội trưởng.",
                        color: "danger",
                    });
                } else {
                    addToast({
                        title: "Lỗi",
                        description: "Chi hội đã có chi hội trưởng. Vui lòng chọn chi hội khác.",
                        color: "danger",
                    });
                }
            } else {
                addToast({
                    title: "Lỗi",
                    description: "Không thể cập nhật chi hội trưởng. Vui lòng thử lại.",
                    color: "danger",
                });
            }
        }
        setIsSubmitting(false);
    }

    return (
        <Modal isOpen={isModalOpen} onOpenChange={handleClose} classNames={{ backdrop: "z-2" }}>
            <ModalContent className="max-w-3xl w-full p-8 rounded-2xl shadow-2xl bg-white">
                <ModalHeader className="text-2xl font-semibold text-gray-800">
                    Chỉnh sửa tài khoản chi hội trưởng
                </ModalHeader>

                <ModalBody>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm">Tên</label>
                                <Input className="w-full" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div>
                                <label className="text-sm">Email</label>
                                <Input className="w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div>
                                <label className="text-sm">Tên công ty</label>
                                <Input className="w-full" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>

                            <div>
                                <label>Danh xưng</label>
                                <Select
                                    className="w-full"
                                    selectedKeys={salutation ? [salutation] : []}
                                    onSelectionChange={(sel) => setSalutation(sel.currentKey)}
                                >
                                    {salutations.map((salutation) => (
                                        <SelectItem key={salutation.key}>{salutation.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm">Số điện thoại</label>
                                <Input
                                    type="text"
                                    className="w-full"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        setPhone(value);
                                    }}
                                    maxLength={10}
                                />
                            </div>

                            {/* <div>
                                <label className="text-sm">Địa chỉ</label>
                                <Input className="w-full" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div> */}

                            <div>
                                <label className="text-sm">Chức vụ</label>
                                <Input className="w-full" value={position} onChange={(e) => setPosition(e.target.value)} />
                            </div>

                            <div>
                                <label className="text-sm">Chọn chi hội</label>
                                <Autocomplete
                                    className="w-full"
                                    selectedKey={branchId}
                                    defaultItems={branches}
                                    onSelectionChange={(selectedKey) => setBranchId(selectedKey as string)}
                                >
                                    {branches.map((branch) => (
                                        <AutocompleteItem key={branch.id}>{branch.name}</AutocompleteItem>
                                    ))}
                                </Autocomplete>
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button variant="bordered" className="px-6 py-2" onPress={() => handleClose(false)}>
                        Đóng
                    </Button>
                    <Button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        isLoading={isSubmitting}
                        onPress={handleUpdate}
                    >
                        Xác nhận
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

    );
};