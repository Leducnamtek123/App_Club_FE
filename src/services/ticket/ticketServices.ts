import axiosInstance from "@/lib/api/api";

export const getAllTicketsByEventId = async ({
  page = 1,
  take = 10,
  q = "",
  order = undefined,
  userId = undefined,
  eventId = undefined,
  status = undefined,
}: {
  page?: number;
  take?: number;
  q?: string;
  order?: string;
  userId?: string;
  eventId?: string;
  status?: string;
}) => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (order) params.order = order;
    if (userId) params.userId = userId;
    if (eventId) params.eventId = eventId;
    if (status) params.status = status;
    const response = await axiosInstance.get("/tickets", params);
    return response;
  } catch (error) {
    return error;
  }
};

export const confirmPayment = async (ticketId: string) => {
  try {
    const response = await axiosInstance.post(`/tickets/${ticketId}/confirm-payment`);
    return response;
  } catch (error) {
    throw error;
  }
};
