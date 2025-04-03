import apiService from "@/lib/api/api";

export const getSponsorByEventId = async ({
  page = 1,
  take = 10,
  q = "",
  eventId = undefined,
}: {
  page?: number;
  take?: number;
  q?: string;
  eventId?: string;
}) => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (eventId) params.eventId = eventId;
    const response = await apiService.get("/sponsorships", params);
    return response;
  } catch (error) {
    throw error;
  }
};

export const addSponsor = async (data: object) => {
  try {
    const response = await apiService.post("/sponsorships", data, {
      contentType: "multipart/form-data",
    });
    if (response.status === 400) {
      const errorMessage =
        response.data?.message ||
        "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
      throw new Error(errorMessage);
    }
    return response;
  } catch (error) {
    throw error;
  }
};
export const updateSponsor = async (data: object,userId:string) => {
  try {
    const response = await apiService.patch(`/sponsorships/${userId}`, data, {
      contentType: "multipart/form-data",
    });
    if (response.status === 400) {
      const errorMessage =
        response.data?.message ||
        "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
      throw new Error(errorMessage);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const getSponsorRankByEvent = async (eventId: string) => {
  try {
    const response = await apiService.get(
      `/sponsorships/event/${eventId}/sponsors-by-tier`
    );
    return response;
  } catch (error) {}
};
