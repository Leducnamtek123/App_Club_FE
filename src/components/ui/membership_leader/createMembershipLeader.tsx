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
import { createMembershipLeader } from "@/services/membership_leader/membershipLeaderServices";
import { getBranches } from "@/services/branch/branchServices";


export const salutations = [
    { key: "Anh", label: "Anh" },
    { key: "Chị", label: "Chị" },
];

// export const positions = [
//     { key: "Giám đốc điều hành", label: "Giám đốc điều hành" },
//     { key: "Giám đốc vận hành", label: "Giám đốc vận hành" },
// ];

export default function FormCreateMembershipLeader({
    isModalOpen,
    setIsModalOpen,
    refreshData,
}: {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    refreshData: () => void;
}) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [branchId, setBranchId] = useState("");
    const [position, setPosition] = useState("");
    const [salutation, setSalutation] = useState("");
    const [birthDate, setBirthDate] = useState("");
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
        // async function fetchData() {
        //     try {
        //         setIsLoading(true);
        //         const branches = await getBranches();
        //         console.log("This is Branches:: ", branches);

        //         if (branches) {
        //             setBranches(branches);
        //         } else {
        //             console.error("Error call API");
        //             setIsLoading(false);
        //         }
        //     } catch (error) {
        //         throw error;
        //     } finally {
        //         setIsLoading(false);
        //     }
        // }
        fetchData();
    }, []);


    const handleClose = (open: boolean) => {
        setIsModalOpen(open);
    };

    const handleCreate = async () => {
        console.log("handleCreate triggered");

        if (!name.trim() || !phone.trim() || !email.trim() || !password.trim() || !branchId) {
            addToast({
                title: "Lỗi",
                description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
                color: "danger",
            });
            return;
        }

        if (phone.length !== 10) {
            addToast({
                title: "Lỗi",
                description: "Số điện thoại phải có đúng 10 chữ số.",
                color: "danger",
            });
            return;
        }

        if (password.length < 6) {
            addToast({
                title: "Lỗi",
                description: "Mật khẩu phải có ít nhất 6 ký tự.",
                color: "danger",
            });
            return;
        }

        const payload = {
            name: name,
            phone: phone,
            zaloPhone: phone,
            email: email,
            password: password,
            companyName: companyName,
            address: address,
            branchId: branchId,
            position: position,
            salutation: salutation,
            birthDate: birthDate,
            role: "ADMIN",
            referrerName: "123",
            // avatar: img
        };

        setIsSubmitting(true);
        try {
            await createMembershipLeader(payload);
            addToast({
                title: "Thành công",
                description: "Tạo chi hội trưởng thành công.",
                color: "success",
            });
            setIsModalOpen(false);
            refreshData();
        } catch (error) {
            if (error.response?.status === 400) {
                addToast({
                    title: "Lỗi",
                    description: "Chi hội đã có chi hội trưởng. Vui lòng chọn chi hội khác.",
                    color: "danger",
                });
            } else {
                addToast({
                    title: "Lỗi",
                    description: "Không thể tạo chi hội trưởng. Vui lòng thử lại.",
                    color: "danger",
                });
            }
        }
        setIsSubmitting(false);
    };

    return (
        <Modal isOpen={isModalOpen} onOpenChange={handleClose} classNames={{ backdrop: "z-2" }}>
            <ModalContent className="max-w-3xl w-full p-8 rounded-2xl shadow-2xl bg-white">
                <ModalHeader className="text-2xl font-semibold text-gray-800">
                    Tạo tài khoản chi hội trưởng
                </ModalHeader>

                <ModalBody>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label>Tên</label>
                                <Input className="w-full" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div>
                                <label>Email</label>
                                <Input className="w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div>
                                <label>Tên công ty</label>
                                <Input className="w-full" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            </div>

                            <div>
                                <label>Chọn chi hội</label>
                                <Autocomplete className="w-full" defaultItems={branches} onSelectionChange={(selectedKey) => setBranchId(selectedKey as string)}>
                                    {branches.map((branch) => (
                                        <AutocompleteItem key={branch.id}>{branch.name}</AutocompleteItem>
                                    ))}
                                </Autocomplete>
                            </div>

                            <div>
                                <label>Danh xưng</label>
                                <Select className="w-full" onSelectionChange={(sel) => setSalutation(sel.currentKey)}>
                                    {salutations.map((salutation) => (
                                        <SelectItem key={salutation.key}>{salutation.label}</SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label>Số điện thoại</label>
                                <Input
                                    type="text"

                                    className="w-full"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ""); // Chỉ giữ lại số
                                        setPhone(value);
                                    }}
                                    maxLength={10} // Giới hạn 10 ký tự
                                />

                            </div>

                            <div>
                                <label>Mật khẩu</label>
                                <Input
                                    type="password"
                                    className="w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6} // Không thể nhập ít hơn 6 ký tự
                                />
                            </div>

                            <div>
                                <label>Địa chỉ</label>
                                <Input className="w-full" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>

                            <div>
                                <label>Chức vụ</label>
                                {/* <Select className="w-full" label="Chức vụ" onSelectionChange={(sel) => setPosition(sel.currentKey)}>
                                    {positions.map((position) => (
                                        <SelectItem key={position.key}>{position.label}</SelectItem>
                                    ))}
                                </Select> */}
                                <Input className="w-full" value={position} onChange={(e) => setPosition(e.target.value)} />
                            </div>

                            <div>
                                <label>Ngày sinh</label>
                                <Input type="date" className="w-full" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* <div className="mt-6">
                        <label>Chọn ảnh</label>
                        <Input type="file" placeholder="Choose image" accept="image/*" className="w-full" onChange={handleImageChange} />
                    </div> */}
                </ModalBody>

                <ModalFooter>
                    <Button
                        variant="bordered"
                        className="px-6 py-2"
                        onPress={() => handleClose(false)}>
                        Đóng
                    </Button>
                    <Button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        onPress={handleCreate}
                        isLoading={isSubmitting}
                    >
                        Tạo
                    </Button>
                </ModalFooter>

            </ModalContent>
        </Modal>
    );
};