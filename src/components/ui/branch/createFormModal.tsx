import { createBranch, updateBranch } from "@/services/branch/branchServices";
import { getMembershipLeaders } from "@/services/membership_leader/membershipLeaderServices";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  addToast,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Branch } from "@/lib/model/type";

export default function ModalCreateBranch({
  isModalOpen,
  setIsModalOpen,
  setSelectedData,
  refreshData,
  selectedBranch,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  setSelectedData?: (data: any | null) => void;
  refreshData: () => void;
  selectedBranch?: Branch | null;
}) {
  const [branchName, setBranchName] = useState("");
  const [branchDescription, setBranchDescription] = useState("");
  const [memberships, setMemberships] = useState<any[]>([]);
  const [membershipLeaderId, setMembershipLeaderId] = useState("");
  
  const [errors, setErrors] = useState({
    branchName: "",
    membershipLeader: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    take: 10,
    order: undefined,
    branchId: undefined,
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
    if (selectedBranch) {
      setBranchName(selectedBranch.name || "");
      setBranchDescription(selectedBranch.description || "");
      setMembershipLeaderId(selectedBranch.leader?.id || "");
    } else {
      setBranchName("");
      setBranchDescription("");
      setMembershipLeaderId("");
    }
  }, [selectedBranch]);

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
      setMemberships(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error fetching membership leaders:", error);
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      branchName: "",
      membershipLeader: "",
      description: "",
    };

    if (!branchName.trim()) {
      newErrors.branchName = "Tên chi hội không được để trống";
      isValid = false;
    } else if (branchName.trim().length < 3) {
      newErrors.branchName = "Tên chi hội phải có ít nhất 3 ký tự";
      isValid = false;
    }

    if (selectedBranch && !membershipLeaderId) {
      newErrors.membershipLeader = "Vui lòng chọn chi hội trưởng";
      isValid = false;
    }

    if (branchDescription.length > 500) {
      newErrors.description = "Thông tin chi tiết không được vượt quá 500 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setErrors({ branchName: "", membershipLeader: "", description: "" });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin nhập",
        color: "danger",
        classNames: { base: "z-3" },
      });
      return;
    }

    const payload = {
      name: branchName,
      description: branchDescription,
      ...(selectedBranch ? { leaderId: membershipLeaderId } : {}),
    };

    setIsSubmitting(true);
    try {
      if (selectedBranch) {
        await updateBranch(selectedBranch.id, payload);
        addToast({
          title: "Thành công",
          description: "Cập nhật chi hội thành công.",
          color: "success",
          classNames: { base: "z-3" },
        });
      } else {
        await createBranch(payload);
        addToast({
          title: "Thành công",
          description: "Tạo chi hội thành công.",
          color: "success",
          classNames: { base: "z-3" },
        });
      }
      setBranchName("");
      setBranchDescription("");
      setMembershipLeaderId("");
      setErrors({ branchName: "", membershipLeader: "", description: "" });
      refreshData();
      handleClose(false);
    } catch (error: any) {
      console.error("Lỗi khi xử lý chi hội:", error.response?.data || error.message);
      if (error.response?.status === 500) {
        addToast({
          title: "Lỗi",
          description: "Chi Hội trưởng đã thuộc về chi hội khác.",
          color: "danger",
          classNames: { base: "z-3" },
        });
      } else {
        addToast({
          title: "Lỗi",
          description: selectedBranch ? "Cập nhật chi hội thất bại" : "Tạo chi hội thất bại",
          color: "danger",
          classNames: { base: "z-3" },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onOpenChange={handleClose}
      classNames={{ backdrop: "z-2" }}
    >
      <ModalContent className="max-w-lg w-1/3 p-8 rounded-2xl shadow-2xl bg-white">
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          {selectedBranch ? "Chỉnh sửa chi hội" : "Tạo chi hội"}
        </ModalHeader>
        <ModalBody>
          <Form className="flex flex-col gap-6">
            <Input
              label="Tên chi hội"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              isInvalid={!!errors.branchName}
              errorMessage={errors.branchName}
              isRequired
              isDisabled={!!selectedBranch} // Disable khi chỉnh sửa
            />
            {selectedBranch && (
              <Autocomplete
                className=""
                label="Chi hội trưởng"
                defaultItems={memberships}
                selectedKey={membershipLeaderId}
                onSelectionChange={(selectedKey) => {
                  if (selectedKey) setMembershipLeaderId(selectedKey as string);
                }}
                isInvalid={!!errors.membershipLeader}
                errorMessage={errors.membershipLeader}
                isRequired
              >
                {memberships.map((membership) => (
                  <AutocompleteItem key={membership.id}>
                    {membership.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            )}
            <Textarea
              label="Thông tin chi tiết"
              value={branchDescription}
              onChange={(e) => setBranchDescription(e.target.value)}
              isInvalid={!!errors.description}
              errorMessage={errors.description}
              maxLength={500}
            />
          </Form>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-4">
          <Button
            variant="bordered"
            className="px-6 py-2"
            onPress={() => handleClose(false)}
          >
            Đóng
          </Button>
          <Button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onPress={handleSubmit}
            isLoading={isSubmitting}
          >
            {selectedBranch ? "Cập nhật" : "Tạo"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};