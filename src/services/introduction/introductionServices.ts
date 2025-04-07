import apiService from "@/lib/api/api";


export const getIntroduction = async ()=>{
    try {
        const response = await apiService.get("/introduction");
        return response.data;
    } catch (error) {
        throw error;
    }
}


export const createIntroduction = async(data: any) => {
    try {
        const request = await apiService.post("/introduction", data,{
            headers: { "Content-Type": "multipart/form-data" },
          });
        if (request.status === 400) {
            const errorMessage =
                request.data?.message ||
                "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return request
    } catch (error) {
        throw error;
    }
}


export const updateIntroduction = async(data: any) => {
    try {
        const request = await apiService.put("/introduction", data,{
            headers: { "Content-Type": "multipart/form-data" },
          });
        if (request.status === 400) {
            const errorMessage =
                request.data?.message ||
                "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return request.data
    } catch (error) {
        throw error;
    }
}

