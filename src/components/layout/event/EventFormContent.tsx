"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Branch, EventAggregate, SponsorshipTierDTO } from "@/lib/model/type";
import { getBranches } from "@/services/branch/branchServices";
import {
    getBenefitByEventId,
    getEventAggregateById,
} from "@/services/event/eventServices";
import { CircularProgress, Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { FaAward, FaEdit, FaGem, FaMedal, FaTrophy } from "react-icons/fa";
import Image from "next/image";
import AddEditEvent from "@/components/ui/event/AddEvent";

export default function EventFormContent({ onEditButtonRender }) {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const eventId = searchParams.get("id") || id;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Chưa có thông tin";
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            second: "2-digit",
            timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date(dateString));
    };

    const formatCurrency = (amount?: string | number) => {
        if (!amount || amount === "0") return "Miễn phí";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(amount));
    };

    const sponsorshipIcons = {
        "Kim cương": <FaGem className="text-blue-400" />,
        "Vàng": <FaMedal className="text-yellow-400" />,
        "Bạc": <FaAward className="text-gray-400" />,
        "Đồng": <FaTrophy className="text-orange-400" />,
    };

    const sponsorshipColors = {
        "Kim cương": "bg-blue-400",
        "Vàng": "bg-yellow-400",
        "Bạc": "bg-gray-400",
        "Đồng": "bg-orange-400",
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [eventAggregate, setEventAggregate] = useState<EventAggregate | null>(null);
    const [benefitData, setBenefitData] = useState<SponsorshipTierDTO[]>([]);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [mainImage, setMainImage] = useState<string | null>(null);

    useEffect(() => {
        if (eventAggregate && eventAggregate.event.images && eventAggregate.event.images.length > 0) {
            setMainImage(eventAggregate.event.images[0]);
        }
    }, [eventAggregate]);

    const editButton = useMemo(
        () => (
            <Button
                endContent={<FaEdit />}
                size="md"
                color="primary"
                onPress={() => setIsEditMode(!isEditMode)}
            >
                {isEditMode ? "Xem thông tin" : "Chỉnh sửa"}
            </Button>
        ),
        [isEditMode]
    );

    useEffect(() => {
        if (onEditButtonRender) {
            onEditButtonRender(editButton);
        }
    }, [onEditButtonRender, editButton]);
    useEffect(() => {
        if (!isEditMode) {
            fetchData();
        }
    }, [isEditMode]);
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [branchData, eventData] = await Promise.all([
                getBranches(),
                eventId ? getEventAggregateById(Array.isArray(eventId) ? eventId[0] : eventId) : null,
            ]);
            setBranches(branchData || []);
            localStorage.setItem("selectedEvent",JSON.stringify(eventData));
            setEventAggregate(eventData); // Lưu dữ liệu trực tiếp vào eventAggregate
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBenefitData = async () => {
        if (!eventId) return;
        try {
            const response = await getBenefitByEventId(Array.isArray(eventId) ? eventId[0] : eventId);
            setBenefitData(response || []);
        } catch (error) {
            console.error("Error fetching benefits:", error);
        }
    };

    useEffect(() => {
        fetchBenefitData();
        fetchData();
    }, [eventId]);

    const renderViewMode = () => {
        if (!eventAggregate || isLoading) {
            return (
                <div className="flex items-center justify-center">
                    <CircularProgress />
                </div>
            );
        }

        return (
            <section className="flex justify-center z-0">
                <div className="w-full flex gap-6">
                    <Card className="w-2/3 shadow-xl rounded-xl overflow-hidden">
                        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                            <h2 className="font-bold text-xl text-gray-800">Thông tin sự kiện</h2>
                        </CardHeader>
                        <CardBody className="p-6">
                            {eventAggregate.event.images && eventAggregate.event.images.length > 0 ? (
                                <div className="mb-6">
                                    <div className="relative w-full h-64 bg-white">
                                        <Image
                                            src={mainImage || eventAggregate.event.images[0]}
                                            alt={eventAggregate.event.title || "Hình ảnh sự kiện"}
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>

                                    {eventAggregate.event.images.length > 1 && (
                                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                            {eventAggregate.event.images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer"
                                                    onClick={() => setMainImage(img)}
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Hình ảnh phụ ${idx + 1}`}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-6 bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Chưa có hình ảnh</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <p>
                                    <strong className="text-gray-700">Tên sự kiện:</strong>{" "}
                                    {eventAggregate.event?.title || "Chưa có thông tin"}
                                </p>
                                <p className="text-gray-600">
                                    <strong className="text-gray-700">Đơn vị tổ chức:</strong>{" "}
                                    {eventAggregate.event.branch?.name||"Chưa có thông tin"}
                                </p>
                                <p>
                                    <strong className="text-gray-700">Địa điểm:</strong>{" "}
                                    {eventAggregate.event?.location || "Chưa có thông tin"}
                                </p>
                                <p>
                                    <strong className="text-gray-700">Ngày kết thúc bán vé:</strong>{" "}
                                    {formatDate(eventAggregate.event?.ticketClosingDate)}
                                </p>
                                <p>
                                    <strong className="text-gray-700">Ngày kết thúc:</strong>{" "}
                                    {formatDate(eventAggregate.event?.endDate)}
                                </p>
                                <p>
                                    <strong className="text-gray-700">Ngày tổ chức:</strong>{" "}
                                    {formatDate(eventAggregate.event?.startDate)}
                                </p>
                               
                             
                                <p>
                                    <strong className="text-gray-700">Giá vé:</strong>{" "}
                                    {formatCurrency(eventAggregate?.event.ticketPrice)}
                                </p>
                                <p className="text-green-600">
                                    <strong className="text-gray-700">Trạng thái:</strong>{" "}
                                    {eventAggregate.event.status || "Sắp diễn ra"}
                                </p>
                                <p className="col-span-2">
                                    <strong className="text-gray-700">Nội dung sự kiện:</strong>{" "}
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: eventAggregate.event?.description || "Chưa có nội dung",
                                        }}
                                    />
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="w-1/3 shadow-xl rounded-xl overflow-hidden">
                        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                            <h2 className="font-bold text-xl text-gray-800">Hạng tài trợ</h2>
                        </CardHeader>
                        <CardBody className="p-6">
                            {benefitData.length > 0 ? (
                                benefitData.map((benefit, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 mb-4 bg-white relative shadow-md rounded-lg transition-transform hover:scale-[1.02]"
                                    >
                                        <CardHeader className="flex items-center gap-2 border-b pb-2">
                                            {sponsorshipIcons[benefit.name] || null}
                                            <h3 className="font-semibold text-lg">{benefit.name || "Không xác định"}</h3>
                                        </CardHeader>
                                        <CardBody className="pt-3">
                                            <p>
                                                <strong>Mức tài trợ tối thiểu:</strong>{" "}
                                                {formatCurrency(benefit.minAmount)}
                                            </p>
                                            <p className="mt-2">
                                                <strong>Quyền lợi:</strong>
                                            </p>
                                            <ul className="list-disc pl-5 text-sm">
                                                {Array.isArray(benefit.benefits) && benefit.benefits.length > 0 ? (
                                                    benefit.benefits.map((item, idx) => (
                                                        <li key={idx}>{String(item.title)}</li>
                                                    ))
                                                ) : (
                                                    <li>Chưa có quyền lợi</li>
                                                )}
                                            </ul>
                                        </CardBody>
                                        <div
                                            className={`absolute top-0 right-0 h-full w-2 ${sponsorshipColors[benefit.name] || "bg-gray-200"}`}
                                            title={benefit.name}
                                        />
                                    </Card>
                                ))
                            ) : (
                                <p className="text-gray-500">Chưa có hạng tài trợ</p>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </section>
        );
    };

    return (
        <div className="min-h-screen py-8">
            {isEditMode ? (
                <AddEditEvent />
            ) : (
                renderViewMode()
            )}
        </div>
    );
}