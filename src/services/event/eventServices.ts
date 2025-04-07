import axiosInstance from "@/lib/api/api";
import { EventAggregate } from "@/lib/model/type";

export const getEventAggregateById = async (eventId: string): Promise<EventAggregate> => {
  try {
    const response = await axiosInstance.get(`/events/aggregate/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event aggregate:", error);
    throw error; // Ném lỗi để xử lý ở nơi gọi hàm
  }
};

export const getAllEvents = async ({
  page = 1,
  take = 10,
  q = "",
  title = "",
  order = undefined,
  branchId = undefined,
  status = undefined,
  isFree = undefined,
  startDate = undefined,
  endDate = undefined,
}: {
  page?: number;
  take?: number;
  q?: string;
  order?: string;
  branchId?: string | undefined;
  status?: string;
  title?: string;
  isFree?: boolean;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (order) params.order = order;
    if (branchId) params.branchId = branchId;
    if (status) params.status = status;
    if (title) params.title = title;
    if (isFree) params.isFree = isFree;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axiosInstance.get("/events", {
      params: params
    });
    
    return response.data;
  } catch (error) {
    return error;
  }
};

export const createEvent = async (data: FormData) => {
  try {
    const response = await axiosInstance.post("/events", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
export const createEventAggregate = async (data: FormData) => {
  try {

    const response = await axiosInstance.post("/events/aggregate", data, { 
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response;
  } catch (error) {
    throw error;
  }
};


export const updateEventAggregate = async (eventId: string, data: FormData) => {
  try {
    const response = await axiosInstance.put(`/events/aggregate/${eventId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addEventBenefit = async (data: object) => {
  try {
    const response = await axiosInstance.post("/sponsorship-tiers", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateEventBenefit = async (benefitId: string, data: object) => {
  try {
    const response = await axiosInstance.put(
      `/sponsorship-tiers/${benefitId}`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const response = await axiosInstance.delete(`/events/${eventId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getBenefitByEventId = async (eventId: string) => {
  try {
    const response = await axiosInstance.get(
      `/sponsorship-tiers/event/${eventId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
