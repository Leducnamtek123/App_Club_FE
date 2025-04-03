"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import SponsorshipTiers from "@/components/ui/event/SponsorshipTiers";
import EventForm from "@/components/ui/event/EventForm";
import { Branch, EventAggregate, EventBenefit, SponsorshipTier, SponsorshipTierDTO } from "@/lib/model/type";
import { getBranches } from "@/services/branch/branchServices";
import { getEventAggregateById, createEventAggregate, updateEventAggregate, deleteEvent } from "@/services/event/eventServices";
import { getSponsorBenefits } from "@/services/sponsorship-benefit/sponsorshipBenefit";
import { addToast, Button, CircularProgress, DateValue, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { EventStatus } from "@/lib/enum/event-status.enum";

export default function AddEditEvent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id") || id;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(!!eventId);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [eventData, setEventData] = useState<EventAggregate | null>(null);
  const [sponsorshipTiers, setSponsorshipTiers] = useState<SponsorshipTierDTO[]>([]);
  const [benefitData, setBenefitData] = useState<EventBenefit[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const editorContentRef = useRef<string>("");
  const TIERS = [
    { name: "Kim cương", key: "diamond", color: "bg-gradient-to-r from-purple-500 to-blue-500" },
    { name: "Vàng", key: "platinum", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
    { name: "Bạc", key: "gold", color: "bg-gradient-to-r from-gray-300 to-gray-500" },
    { name: "Đồng", key: "silver", color: "bg-gradient-to-r from-orange-300 to-red-400" },
  ];
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [branchData, eventResponse, sponsorBenefits] = await Promise.all([
          getBranches(),
          eventId ? getEventAggregateById(eventId as string) : Promise.resolve(null),
          getSponsorBenefits({ page: 1, take: 50 }),
        ]);
        setBranches(branchData || []);
        setBenefitData(Array.isArray(sponsorBenefits) ? sponsorBenefits : []);
        if (eventId && eventResponse) {
          setIsEditMode(true);
          setEventData(eventResponse);
          setSponsorshipTiers(eventResponse.sponsorshipTiers || []); // Dữ liệu từ server là SponsorshipTierDTO[]
          setExistingImages(eventResponse.event.images || []);
          setSelectedBranch(eventResponse.event.branch);
          editorContentRef.current = eventResponse.event.description || "";
          localStorage.setItem("selectedEvent", JSON.stringify(eventResponse));
        } else {
          setIsEditMode(false);
          setEventData(null);
          setSponsorshipTiers([]);
          setExistingImages([]);
          setSelectedBranch(null);
          editorContentRef.current = "";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        addToast({ title: "Lỗi", description: "Không thể tải dữ liệu", color: "danger" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "title",
      "location",
      "description",
      "ticketPrice",
      "ticketClosingDate",
      "startDate",
      "endDate",
    ];

    requiredFields.forEach((field) => {
      const fieldValue = eventData?.event[field]?.toString().trim();
      if (!fieldValue && (!isEditMode || !eventData?.event[field])) {
        newErrors[field] = "Trường này không được để trống";
      }
    });

    if (!editorContentRef.current && (!isEditMode || !eventData?.event.description)) {
      newErrors.description = "Nội dung sự kiện không được để trống";
    }

    if (!eventData?.event.branchId && !selectedBranch) {
      newErrors.branchId = "Nhà tổ chức không được để trống";
    }

    if (!isEditMode && imageFiles.length === 0 && (!eventData?.event.images || eventData.event.images.length === 0)) {
      newErrors.images = "Vui lòng chọn ít nhất một hình ảnh";
    } else if (isEditMode && imageFiles.length === 0 && (!eventData?.event.images || eventData.event.images.length === 0)) {
      newErrors.images = "Vui lòng chọn ít nhất một hình ảnh nếu sự kiện chưa có hình ảnh";
    }

    const startDate = new Date(eventData?.event.startDate);
    const endDate = new Date(eventData?.event.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      newErrors.startDate = "Ngày không hợp lệ";
      newErrors.endDate = "Ngày không hợp lệ";
    } else if (startDate > endDate) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (sponsorshipTiers.length === 0) {
      newErrors.sponsorshipTiers = "Cần có ít nhất một gói tài trợ";
    } else {
      sponsorshipTiers.forEach((tier) => {
        const tierKey = TIERS.find((t) => t.name === tier.name)?.key;
        if (!tierKey) return;

        if (!tier.name.trim()) {
          newErrors[`name-${tierKey}`] = "Tên gói tài trợ không được để trống";
        }
        if (isNaN(Number(tier.minAmount)) || Number(tier.minAmount) < 0) {
          newErrors[`minAmount-${tierKey}`] = "Số tiền tối thiểu phải là số dương";
        }
        if (!tier.benefits || tier.benefits.length === 0) {
          newErrors[`benefitIds-${tierKey}`] = "Phải chọn ít nhất một quyền lợi tài trợ";
        } else {
          tier.benefits.forEach((benefit, benefitIndex) => {
            const benefitExists = benefitData.find((b) => b.id === benefit.id);
            if (!benefitExists && !isEditMode) {
              newErrors[`benefitIds-${tierKey}.${benefitIndex}`] = "Quyền lợi tài trợ không hợp lệ";
            }
          });
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name: string, value: string | DateValue | null) => {
    let finalValue: string | null = null;
    if (name.includes("Date") && value && typeof value !== "string") {
      finalValue = value.toDate("UTC").toISOString();
    } else {
      finalValue = value as string | null;
    }
    setEventData((prev) =>
      prev
        ? { ...prev, event: { ...prev.event, [name]: finalValue } }
        : { event: { ...eventData?.event, [name]: finalValue } } as EventAggregate
    );
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (finalValue) delete newErrors[name];
      else newErrors[name] = "Trường này không được để trống";
      return newErrors;
    });
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    if (imageFiles.length + existingImages.length + newFiles.length > 10) {
      addToast({ title: "Lỗi", description: "Tối đa 10 ảnh", color: "danger" });
      return;
    }
    setImageFiles((prev) => [...prev, ...newFiles]);
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    const removedImage = existingImages[index]; // Lấy URL hoặc ID của hình ảnh bị xóa
    setImagesToDelete((prev) => [...prev, removedImage]); // Thêm vào mảng imagesToDelete
    setExistingImages((prev) => prev.filter((_, i) => i !== index)); // Xóa khỏi existingImages
    setEventData((prev) =>
      prev
        ? { ...prev, event: { ...prev.event, images: prev.event.images.filter((_, i) => i !== index) } }
        : null
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      addToast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", color: "danger" });
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();

      if (isEditMode) formData.append("id", eventId as string);
      formData.append("description", editorContentRef.current);
      formData.append("branchId", eventData?.event.branchId || selectedBranch?.id || "");
      formData.append("status", eventData?.event.status || EventStatus.UPCOMING);
      formData.append("title", eventData?.event.title || "");
      formData.append("location", eventData?.event.location || "");
      formData.append("ticketPrice", eventData?.event.ticketPrice?.toString() || "0");
      formData.append("ticketClosingDate", eventData?.event.ticketClosingDate || "");
      formData.append("startDate", eventData?.event.startDate || "");
      formData.append("endDate", eventData?.event.endDate || "");

      // Gửi danh sách hình ảnh hiện có còn lại
      existingImages.forEach((url, index) => {
        formData.append(`existingImages[${index}]`, url);
      });

      // Gửi danh sách hình ảnh cần xóa
      imagesToDelete.forEach((url, index) => {
        formData.append(`imagesToDelete[${index}]`, url);
      });

      // Gửi các file hình ảnh mới
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const sponsorshipTiersForSubmit: SponsorshipTier[] = sponsorshipTiers.map(tier => ({
        name: tier.name,
        minAmount: parseFloat(tier.minAmount.toString()),
        sponsorBenefitIds: tier.benefits.map(benefit => benefit.id)
      }));

      sponsorshipTiersForSubmit.forEach((tier, index) => {
        formData.append(`sponsorshipTiers[${index}][name]`, tier.name);
        formData.append(`sponsorshipTiers[${index}][minAmount]`, tier.minAmount.toString());
        tier.sponsorBenefitIds.forEach((id, idIndex) => {
          formData.append(`sponsorshipTiers[${index}][sponsorBenefitIds][${idIndex}]`, id);
        });
      });

      const response = isEditMode
        ? await updateEventAggregate(eventId as string, formData)
        : await createEventAggregate(formData);

      const eventIdFromResponse = eventId || response?.eventId || response?.event.id;
      if (eventIdFromResponse) {
        addToast({
          title: "Thành công",
          description: isEditMode ? "Cập nhật sự kiện thành công" : "Tạo sự kiện thành công",
          color: "success",
        });
      }
      if (!isEditMode) {
        router.push(`/event`);
      } else {
        // Lấy dữ liệu mới từ server và cập nhật state
        const updatedEvent = await getEventAggregateById(eventIdFromResponse as string);
        setEventData(updatedEvent);
        setExistingImages(updatedEvent.event.images || []);
        setSelectedBranch(updatedEvent.event.branch);
        editorContentRef.current = updatedEvent.event.description || "";
        setImageFiles([]); // Reset hình ảnh mới sau khi lưu
        setImagesToDelete([]); // Reset danh sách hình ảnh cần xóa
      }
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving event:", error);
      addToast({
        title: "Lỗi",
        description: isEditMode ? "Cập nhật sự kiện thất bại" : "Lưu sự kiện thất bại",
        color: "danger",
      });
    } finally {
      
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      await deleteEvent(eventId as string);
      addToast({
        title: "Thành công",
        description: "Xóa sự kiện thành công",
        color: "success",
      });
      router.push("/event");
    } catch (error) {
      console.error("Error deleting event:", error);
      addToast({
        title: "Lỗi",
        description: "Xóa sự kiện thất bại",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
      setIsDeletePopoverOpen(false);
    }
  };

  return isLoading ? (
    <div className="flex items-center justify-center">
      <CircularProgress />
    </div>
  ) : (
    <>
      <div className="w-full flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{isEditMode ? "Chỉnh sửa sự kiện" : "Thêm sự kiện"}</h1>
        <div className="flex gap-3">
          {!eventId && (
            <Button
              variant="bordered"
              className="bg-white"
              onPress={() => router.push("/event")}
            >
              Hủy
            </Button>
          )}
          {eventId && (
            <Popover
              placement="bottom-end"
              isOpen={isDeletePopoverOpen}
              onOpenChange={(open) => setIsDeletePopoverOpen(open)}
            >
              <PopoverTrigger>
                <Button
                  color="danger"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xóa..." : "Xóa"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                {(titleProps) => (
                  <div className="px-4 py-3 w-64">
                    <h3 className="text-small font-bold" {...titleProps}>
                      Xác nhận xóa sự kiện
                    </h3>
                    <div className="text-tiny mt-1">
                      Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setIsDeletePopoverOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={handleDelete}
                        isLoading={isLoading}
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSaving}
            disabled={isSaving}
          >
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-row gap-4">
        <div className="w-1/2">
          <EventForm
            eventData={eventData || null}
            branchData={branches}
            errors={errors}
            imageFiles={imageFiles}
            onFieldChange={handleFieldChange}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            onRemoveExistingImage={handleRemoveExistingImage}
            editorContentRef={editorContentRef}
            selectedBranch={selectedBranch}
          />
        </div>
        <div className="w-1/2">
          <SponsorshipTiers
            sponsorshipTiers={sponsorshipTiers}
            setSponsorshipTiers={setSponsorshipTiers}
            benefitData={benefitData}
            errors={errors}
          />
        </div>
      </div>
    </>
  );
}