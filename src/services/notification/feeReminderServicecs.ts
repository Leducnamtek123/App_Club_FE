import apiService from "@/lib/api/api"

export const feeReminder = async (data: object) => {
    try {
        await apiService.post("/zalo-notifications/remind-fee", data);
       
    } catch (error) {
        throw error;
    }
}