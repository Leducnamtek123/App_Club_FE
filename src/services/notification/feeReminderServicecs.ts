import axiosInstance from "@/lib/api/api";

export const feeReminder = async (data: object) => {
    try {
        await axiosInstance.post("/zalo-notifications/remind-fee", data);
       
    } catch (error) {
        throw error;
    }
}