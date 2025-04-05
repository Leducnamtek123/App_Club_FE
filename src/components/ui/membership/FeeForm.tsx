"use client";

import {
  addMemberFee,
  getMemberFeeByUser,
} from "@/services/membership/membershipServices";
import { getMembershipFee } from "@/services/membership_fee/membershipFeeServices";
import {
  addToast,
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableColumn,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Textarea,
} from "@heroui/react";
import { useEffect, useState } from "react";

const columns = [
  { name: "Năm", uid: "year" },
  { name: "Nội dung", uid: "description" },
  { name: "Ngày tạo", uid: "createdAt" },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0];
};

export default function FeeForm({
  isModalOpen,
  setIsModalOpen,
  selectedData,
  onFeeAdded,
  isFullView = true,
}: any) {
  const [formData, setFormData] = useState({
    user_id: selectedData?.id ?? "",
    name: selectedData?.name ?? "",
    phone: selectedData?.phone ?? "",
    year: "",
    description: selectedData?.description ?? "",
  });

  const [yearError, setYearError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (selectedData?.id) {
        setIsLoading(true);
        try {
          const response = await getMemberFeeByUser(selectedData.id, 1, 10);
          console.log("Dữ liệu từ API:", response.data);
          setPaymentHistory(response.data || []);
        } catch (error) {
          console.error("Lỗi khi lấy lịch sử thanh toán:", error);
          addToast({
            title: "Lỗi",
            description: "Không thể tải lịch sử thanh toán.",
            variant: "solid",
            color: "danger",
          });
          setPaymentHistory([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    setFormData({
      user_id: selectedData?.id,
      name: selectedData?.name ?? "",
      phone: selectedData?.phone ?? "",
      year: "",
      description: selectedData?.description ?? "",
    });
    setYearError(null);
    setDescriptionError(null);
    fetchPaymentHistory();
  }, [selectedData]);

  useEffect(() => {
    async function fetchData() {
      try {
        const membershipFees = await getMembershipFee();
        if (Array.isArray(membershipFees)) {
          const extractedYears = membershipFees
            .map((fee) => fee.year)
            .sort((a: number, b: number) => a - b);
          setYears(extractedYears);
        }
      } catch (error) {
        console.error("Error fetching membership fees:", error);
      }
    }
    fetchData();
  }, []);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
  };

  const handleConfirm = async () => {
    let hasError = false;

    if (!formData.year) {
      setYearError("Vui lòng chọn năm");
      hasError = true;
    }
    if (hasError) return;
    const selectedYear = formData.year;
    const existingPayment = paymentHistory.find(
      (item) => String(item.year) === selectedYear
    );

    if (existingPayment) {
      addToast({
        title: "Lỗi",
        description: `Phí cho năm ${selectedYear} đã được ghi nhận. Vui lòng chọn năm khác.`,
        variant: "solid",
        color: "danger",
      });
      return;
    }

    const payload = {
      user_id: formData.user_id,
      year: parseInt(formData.year),
      description: formData.description?.trim() ? formData.description : null,
    };

    setIsSubmitting(true);
    try {
      await addMemberFee(payload);
      addToast({
        title: "Thành công",
        description: "Phí đã được ghi nhận thành công!",
        color: "success",
        classNames: { base: "z-3" },
      });
      const response = await getMemberFeeByUser(selectedData.id, 1, 10);
      setPaymentHistory(response.data || []);
      handleClose(false);
      if (onFeeAdded) {
        onFeeAdded();
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Đã có lỗi xảy ra khi ghi nhận phí.";
      addToast({
        title: "Lỗi",
        description: errorMessage,
        color: "danger",
        classNames: { base: "z-3" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "year" && value) {
      setYearError(null);
    }
    if (field === "description" && value.trim()) {
      setDescriptionError(null);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onOpenChange={handleClose}
      classNames={{ backdrop: "" }}
    >
      <ModalContent className={`p-8 rounded-2xl shadow-2xl bg-white ${isFullView ? "max-w-4xl w-full" : "max-w-2xl w-full"}`}>
        <ModalHeader className="text-2xl font-semibold text-gray-800">
          {isFullView ? "Nộp phí" : "Lịch sử nộp phí"}
        </ModalHeader>
        <ModalBody>
          {isFullView ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Form bên trái */}
              <div>
                <Form className="grid gap-5 border p-5 rounded-lg shadow-lg">
                  <Input
                    label="Họ và tên"
                    value={formData.name}
                    onValueChange={handleInputChange("name")}
                    isDisabled
                  />
                  <Input
                    label="Số điện thoại"
                    value={formData.phone}
                    onValueChange={handleInputChange("phone")}
                    isDisabled
                  />
                  <Select
                    label="Chọn năm nộp phí"
                    selectedKeys={formData.year ? [formData.year.toString()] : []}
                    onChange={(e) => handleInputChange("year")(e.target.value)}
                    errorMessage={yearError}
                    isInvalid={!!yearError}
                  >
                    {years.map((year) => (
                      <SelectItem key={year} textValue={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    label="Ghi chú"
                    value={formData.description}
                    onValueChange={handleInputChange("description")}
                  />
                </Form>
              </div>

              {/* Table bên phải */}
              <div className="border p-5 rounded-lg shadow-lg">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Lịch sử nộp phí
                </h3>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Spinner size="md" />
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 h-40 flex items-center justify-center">
                    Chưa có dữ liệu
                  </div>
                ) : (
                  <Table
                    isStriped
                    aria-label="Lịch sử thanh toán phí hội viên"
                    className="max-h-auto overflow-y-auto"
                  >
                    <TableHeader columns={columns}>
                      {(column) => (
                        <TableColumn key={column.uid}>{column.name}</TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={paymentHistory}>
                      {(item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          ) : (
            <div className="border p-5 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Lịch sử nộp phí
              </h3>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner size="md" />
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-4 text-gray-500 h-40 flex items-center justify-center">
                  Chưa có dữ liệu
                </div>
              ) : (
                <Table
                  isStriped
                  aria-label="Lịch sử thanh toán phí hội viên"
                  className="max-h-auto overflow-y-auto"
                >
                  <TableHeader columns={columns}>
                    {(column) => (
                      <TableColumn key={column.uid}>{column.name}</TableColumn>
                    )}
                  </TableHeader>
                  <TableBody items={paymentHistory}>
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.year}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex justify-end gap-4">
          <Button
            variant="bordered"
            className="px-6 py-2"
            onPress={() => handleClose(false)}
          >
            Đóng
          </Button>
          {isFullView && (
            <Button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              onPress={handleConfirm}
              isLoading={isSubmitting}
            >
              Xác nhận nộp phí
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}