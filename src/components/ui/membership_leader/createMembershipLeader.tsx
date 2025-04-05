"use client";

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
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useEffect, useState } from "react";
import { createMembershipLeader } from "@/services/membership_leader/membershipLeaderServices";
import { getBranches } from "@/services/branch/branchServices";

export const salutations = [
  { key: "Anh", label: "Anh" },
  { key: "Chị", label: "Chị" },
];

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
  const [branchId, setBranchId] = useState("");
  const [position, setPosition] = useState("");
  const [salutation, setSalutation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm reset tất cả state về giá trị mặc định
  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setCompanyName("");
    setBranchId("");
    setPosition("");
    setSalutation("");
    setBirthDate("");
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const branches = await getBranches();
      if (branches) {
        setBranches(branches);
      } else {
        console.log("Error fetching branches");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch branches khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isModalOpen) {
      resetForm();
    }
  }, [isModalOpen]);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm(); // Reset form khi đóng modal
    }
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
      name,
      phone,
      zaloPhone: phone,
      email,
      password,
      companyName,
      branchId,
      position,
      salutation,
      birthDate,
      role: "ADMIN",
      referrerName: "123",
    };

    setIsSubmitting(true);
    try {
      await createMembershipLeader(payload);
      addToast({
        title: "Thành công",
        description: "Tạo chi hội trưởng thành công.",
        color: "success",
      });
      setIsModalOpen(false); // Đóng modal
      refreshData(); // Refresh danh sách
      resetForm(); // Reset form ngay sau khi tạo thành công
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
    } finally {
      setIsSubmitting(false);
    }
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
              <Input className="w-full" label="Tên" value={name} onChange={(e) => setName(e.target.value)} />
              <Input className="w-full" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input className="w-full" label="Công ty" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Autocomplete
                className="w-full"
                label="Chi hội"
                defaultItems={branches}
                onSelectionChange={(selectedKey) => setBranchId(selectedKey as string)}
                selectedKey={branchId}
              >
                {branches.map((branch) => (
                  <AutocompleteItem key={branch.id}>{branch.name}</AutocompleteItem>
                ))}
              </Autocomplete>
              <Select
                className="w-full"
                label="Danh xưng"
                onSelectionChange={(sel) => setSalutation(sel.currentKey)}
                selectedKeys={salutation ? [salutation] : []}
              >
                {salutations.map((salutation) => (
                  <SelectItem key={salutation.key}>{salutation.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                label="Số điện thoại"
                className="w-full"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPhone(value);
                }}
                maxLength={10}
              />
              <Input
                label="Mật khẩu"
                type="password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
              <Input
                label="Chức vụ"
                className="w-full"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
              <Input
                type="date"
                label="Ngày sinh"
                className="w-full"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="bordered" className="px-6 py-2" onPress={() => handleClose(false)}>
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
}