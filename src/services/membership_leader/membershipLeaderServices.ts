import apiService from "@/lib/api/api";


export const changePassword = async (data: any) => {
    try {
        const response = await apiService.post("/auth/change-password", data);
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
};


export const getMembershipLeaders = async ({
    page = 1,
    take = 10,
    q = "",
    order = undefined,
    branchId = undefined,
    role = "ADMIN",
}: {
    page?: number;
    take?: number;
    q?: string;
    order?: string;
    branchId?: string | undefined;
    role: "ADMIN";
}) => {
    try {
        const params: { [key: string]: any } = { page, take };
        if (q) params.q = q;
        if (order) params.order = order;
        if (branchId) params.branchId = branchId;
        if (role)params.role = role;

        const response = await apiService .get("/users", params);
        return response;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        return [];
    }
};


export const createMembershipLeader =  async (data: any) => {
    try {
        const response = await apiService.post("/auth/register", data);
        if (response.status === 400) {
            const errorMessage =
              response.data?.message ||
              "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return response;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        throw error;
    }
}

export const editMembershipLeader = async(data: any, id: string) => {
    try {
        const response = await apiService.patch(`/users/${id}`, data);
        if (response.status === 400) {
            const errorMessage =
              response.data?.message ||
              "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return response;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        throw error;
    }
}

export const removeMembershipLeader = async( id: string ) => {
    try {
        const response = await apiService.delete(`/users/${id}`);
        if (response.status === 401) {
            const errorMessage =
              response.data?.message ||
              "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.";
            throw new Error(errorMessage);
        }
        return response;
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        throw error;
    }
}