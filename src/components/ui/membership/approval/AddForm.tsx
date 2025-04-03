"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SponsorshipTiers from "@/components/ui/event/SponsorshipTiers";
import EventDetailsForm from "@/components/ui/event/EventForm";
import { Branch, Event, SponsorshipTier } from "@/lib/model/type";
import { getBranches } from "@/services/branch/branchServices";
import {
  getBenefitByEventId,
  getEventById,
} from "@/services/event/eventServices";
import { CircularProgress } from "@heroui/react";
import { DateValue } from "@internationalized/date";

export default function AddForm() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [benefitData, setBenefitData] = useState([]);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [branchData, eventData] = await Promise.all([
        getBranches(),
        eventId ? getEventById(eventId) : null,
      ]);

      setBranches(branchData);
      if (eventData) {
        setEventData(eventData);
        localStorage.setItem("selectedEvent", JSON.stringify(eventData));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBenefitData = async () => {
    if (!eventId) {
      return;
    }
    try {
      const response = await getBenefitByEventId(eventId);
      setBenefitData(response);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchBenefitData();
  }, []);
  useEffect(() => {
    fetchData();
  }, [eventId]);

  const handleSubmit = () => {
    if (eventData) {
      console.log("Thông tin sự kiện:", eventData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div>
        <p className="font-bold text-2xl">Thêm sự kiện</p>
      </div>
      <div className="mb-5">
        <p className="text-gray-500">Điền đầy đủ nội dung sự kiện</p>
      </div>
      <section className="flex justify-center z-0">
        <div className="w-full flex gap-5">
          <EventDetailsForm
            eventData={eventData}
            branchData={branches} errors={undefined} imageFiles={[]} onFieldChange={function (name: string, value: string | DateValue | null): void {
              throw new Error("Function not implemented.");
            } } onImageUpload={function (files: FileList | null): void {
              throw new Error("Function not implemented.");
            } } onRemoveImage={function (index: number): void {
              throw new Error("Function not implemented.");
            } } editorContentRef={undefined}          />
          <div className="w-2/4 bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
            <div className="mb-5 font-bold">Hạng tài trợ</div>
            <SponsorshipTiers
              benefitData={benefitData} sponsorshipTiers={[]} setSponsorshipTiers={function (tiers: SponsorshipTier[]): void {
                throw new Error("Function not implemented.");
              } }            />
          </div>
        </div>
      </section></>
  );
}