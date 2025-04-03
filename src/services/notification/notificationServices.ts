import apiService from "@/lib/api/api"

export const sendNotif =  async(payload:any)=>{
    try {
        const response = await apiService.post("/zalo-notifications/broadcast",payload);
        return response;
    } catch (error) {
        throw error;
    }
}