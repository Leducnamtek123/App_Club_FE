import apiService from "@/lib/api/api";

export const getMembershipFeeByBranch = async (branchId: string) => {
  try {
    const response = await apiService.get(
      `/membership-payments/report/${branchId}`
    );
    return response;
  } catch (error) {}
};
// export const getEventReportBranch = async (branchId: string) => {
//   try {
//     const response = await apiService.get(`/events/report/?${branchId}`);
//     return response;
//   } catch (error) {}
// };
// export const getEventReport = async ({branchId= undefined}:{branchId:string}) => {
//   try {
//     const params :{[key:string]:any}  ={}
//     if(branchId) params.branchId = branchId
//     const response = await apiService.get(`/events/report`,params);
//     return response;
//   } catch (error) {}
// };

export const getEventReport = async ({ branchId }: { branchId?: string }) => {
  try {
    const params: { [key: string]: any } = {};
    if (branchId) params.branchId = branchId;
    const response = await apiService.get("/events/report", params);
    return response;
  } catch (error) {
    console.error("Error in getEventReport:", error);
    throw error;
  }
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

export const getGrowthUserReport = async ({ branchId }: { branchId?: string }) => {
  try {
    const params: { [key: string]: any } = {};
    if (branchId) params.branchId = branchId;
    const response = await apiService.get("/users/stats-by-year", params);
    return response;
  } catch (error) {
    console.error("Error in getEventReport:", error);
    throw error;
  }
};