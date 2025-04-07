import axiosInstance from "@/lib/api/api";

export const sendNotif =  async(payload:any)=>{
    try {
        const response = await axiosInstance.post("/zalo-notifications/broadcast",payload);
        return response;
    } catch (error) {
        throw error;
    }
}