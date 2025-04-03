import apiService from "@/lib/api/api"; 
import { EventBenefit } from "@/lib/model/type";

export const getSponsorBenefits = async ({
  page = 1,
  take = 10,
  q = "",
  order = undefined,
} = {}): Promise<EventBenefit[]> => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (order) params.order = order;

    const response = await apiService.get("/sponsor-benefits", { params });
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API sponsor benefits:", error);
    throw error;
  }
};
