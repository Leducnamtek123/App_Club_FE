import apiService from "@/lib/api/api";

export const getAllSponsorBenefits = async ()=>{
  try {
    const response = await apiService.get("/sponsor-benefits");
    return response;
  } catch (error) {
    throw error;
  }
}

export const addSponsorBenefit = async(data:object)=>{
  try {
    const response = await apiService.post("/sponsor-benefits",data);
    return response;
  } catch (error) {
    
  }
}

export const updateSponsorBenefit = async(id:string,data:object)=>{
  try {
    const response = await apiService.put(`/sponsor-benefits/${id}`,data);
    return response;
  } catch (error) {
    
  }
}

export const deleteSponsorBenefit = async(id:string)=>{
  try {
    const response = await apiService.delete(`/sponsor-benefits/${id}`);
    return response;
  } catch (error) {
    
  }
}