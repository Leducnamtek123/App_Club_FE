import apiService from "@/lib/api/api";
import { EventAggregateDTO } from "@/lib/model/type";

export const getBenefits = async ({
  page = 1,
  take = 10,
  q = "",
  title = "",
  order = undefined,

}: {
  page?: number;
  take?: number;
  q?: string;
  title?:string;
  order?: string;

}) => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (order) params.order = order;
    if (status) params.status = status;
    if (title) params.title = title;
    const response = await apiService.get("/sponsor-benefits", params);
    return response;
  } catch (error) {
    return error;
  }
};
