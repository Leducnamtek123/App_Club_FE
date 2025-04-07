import axiosInstance from "@/lib/api/api";

export const getTitle = async () => {
  try {
    const response = await axiosInstance.get("/titles");

    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return [];
  }
};

export const createTitle = async (data: any) => {
  try {
    const response = await axiosInstance.post("/titles", data,{
      headers: { "Content-Type": "multipart/form-data" },
    });
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

export const updateTitle = async (id:string,data: any) => {
  try {
    const response = await axiosInstance.put(`/titles/${id}`, data,{
      headers: { "Content-Type": "multipart/form-data" },
  });
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

export const deleteTitle = async(id:string)=>{
  try {
    const response = await axiosInstance.delete(`/titles/${id}`);
    return response ;
  } catch (error) {
    throw error;
  }
}
export const AddTitleForUser = async(userId:string,titleId:string)=>{
  try {
    const response = await axiosInstance.post(`/titles/${titleId}/assign/${userId}`)
    return response;
  } catch (error) {
    
  }
}

export const deleteTitleFromUser = async(userId:string,titleId:string)=>{
  try {
    const response = await axiosInstance.post(`/titles/${titleId}/remove/${userId}`);
    return response;
  } catch (error) {
    
  }
}
