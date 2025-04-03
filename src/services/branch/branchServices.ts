import apiService from "@/lib/api/api";


export const getBranches = async (
    page = 1, 
    take = 100
) => {
    try {
        const response = await apiService.get("/branches", {params: { page, take }});
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
};


export const createBranch = async ( data: object ) => {
    try { 
        const response = await apiService.post("/branches", data);
        if (response.status === 400) {
            const errorMessage =
              response.data?.message ||
              "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return response;
    } catch (error) {
        throw error;
    }
}
export const updateBranch = async ( branch_id:string,data: object ) => {
    try { 
        const response = await apiService.put(`/branches/${branch_id}`, data);
        if (response.status === 400) {
            const errorMessage =
              response.data?.message ||
              "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return response;
    } catch (error) {
        throw error;
    }
}

export const deleteBranch = async ( id: string ) => {
    try {
        const response = await apiService.delete(`/branches/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
}