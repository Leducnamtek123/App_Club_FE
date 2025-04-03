import apiService from "@/lib/api/api";

export const getMembershipFeeByBranch = async (branchId: string) => {
  try {
    const response = await apiService.get(
      `/membership-payments/report/${branchId}`
    );
    return response;
  } catch (error) {}
};
export const getEventReportBranch = async (branchId: string) => {
  try {
    const response = await apiService.get(`/events/report/?${branchId}`);
    return response;
  } catch (error) {}
};

export const getSponsorRanking = async ({
  order = "ASC",
  page = 1,
  take = 50,
  q = "",
  branchId = undefined,
  eventId = undefined,
}: {
  order: string;
  page: number;
  take: number;
  q: string;
  branchId: string;
  eventId: string;
}) => {
  try {
    const params: { [key: string]: any } = { order, page, take };
    if (q) params.q = q;
    if (order) params.order = order;
    if (branchId) params.branchId = branchId;
    if (eventId) params.eventId = eventId;
    const response = await apiService.get(
      "/sponsorships/sponsor-ranking",
      params
    );
    return response;
  } catch (error) {
    throw error;
  }
};
