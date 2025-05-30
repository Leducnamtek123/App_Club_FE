import axiosInstance from "@/lib/api/api";

export const getMembershipFee = async () => {
	try {
		const response = await axiosInstance.get("/membership-fees");

		return response.data;
	} catch (error) {
		console.error("Lỗi khi gọi API:", error);
		return [];
	}
};

export const createMembershipFee = async (data: any) => {
	try {
		const response = await axiosInstance.post("/membership-fees", data);
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

export const updateMembershipFee = async(year:number,data:any) =>{
	try {
		const response = await axiosInstance.put(`/membership-fees/${year}`,data);
		return response;
	} catch (error) {
		throw error;
	}
}

export const deleteMembershipFee = async(year:number)=>{
	try {
		const response = await axiosInstance.delete(`/membership-fees/${year}`);
		return response;
	} catch (error) {
		throw error
	}
}