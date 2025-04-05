import apiService from "@/lib/api/api";

export const getApprovedUser = async ({
  page = 1,
  take = 10,
  q = "",
  order = undefined,
  branchId = undefined,
  status = "approved",
  role = undefined,
}: {
  page?: number;
  take?: number;
  q?: string;
  order?: string;
  branchId?: string | undefined;
  status?: string;
  role?: string;
}) => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (order) params.order = order;
    if (branchId) params.branchId = branchId;
    if (status) params.status = status;
    if (role) params.role = role;
    const response = await apiService.get("/users", params);
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return [];
  }
};
export const getPendingUser = async (
  page = 1,
  take = 10,
  status = "pending"
) => {
  try {
    const response = await apiService.get("/users", { page, take, status });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return [];
  }
};

export const updateUser = async (userId: string, data: object) => {
  try {
    const response = await apiService.patch(`/users/${userId}`, data, {
      contentType: "multipart/form-data",
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await apiService.delete(`/users/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const approvedUser = async (userID: string) => {
  try {
    const response = await apiService.patch(`/users/${userID}/approve`, {});
    if (response.status === 400) {
      const errorMessage =
        response.data?.message || "Có lỗi xảy ra, vui lòng kiểm tra lại.";
      throw new Error(errorMessage);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const rejectUser = async (userID: string) => {
  try {
    const response = await apiService.patch(`/users/${userID}/refuse`, {});
    if (response.status === 400) {
      const errorMessage =
        response.data?.message || "Có lỗi xảy ra, vui lòng kiểm tra lại.";
      throw new Error(errorMessage);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const unbanUser = async (userId: string) => {
  try {
    const response = await apiService.patch(`/users/${userId}/unban`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const addMemberFee = async (data: object) => {
  try {
    const response = await apiService.post(`/membership-payments`, data);
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

export const getMemberFeeByUser = async (
  userID: string,
  page = 1,
  take = 10
) => {
  try {
    const response = await apiService.get(
      `/membership-payments?page=${page}&take=${take}&userId=${userID}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllMemberFee = async ({
  page = 1,
  take = 10,
  q = "",
  order = undefined,
  startYear = undefined,
  endYear = undefined,
  branchId = undefined,
  userId = undefined,
}: {
  page?: number;
  take?: number;
  q?: string;
  order?: string;
  startYear?: number;
  endYear?: number;
  branchId?: string | undefined;
  userId?: string | undefined;
}) => {
  try {
    const params: { [key: string]: any } = { page, take };
    if (q) params.q = q;
    if (order) params.order = order;
    if (startYear) params.startYear = startYear;
    if (endYear) params.endYear = endYear;
    if (branchId) params.branchId = branchId;
    if (userId) params.userId = userId;
    const response = await apiService.get(
      `/membership-payments/report`,
      params
    );
    return response;
  } catch (error) {
    throw error;
  }
};
interface ExportMembersParams {
  branchId?: string;
  status?: string;
}

interface GeneratePDFResponse {
  jobId: string;
  downloadUrl: string;
}

export const exportMembersToPDF = async ({
  branchId,
  status = "approved",
}: ExportMembersParams) => {
  try {
    const response = await apiService.get("/export/members-pdf", {
      params: {
        branchId, // Filter by branch if provided
        status, // Filter by status, default to "approved"
      },
    });

    return response; // Returns { jobId, downloadUrl }
  } catch (error) {
    console.error("Error generating members PDF:", error);
    throw error;
  }
};

export const downloadPDF = async (fileName: string) => {
  try {
    const response = await apiService.get(`export/downloads/${fileName}`, {
      responseType: "blob", // Important: request response as Blob for PDF
    });
    return response;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

export const lockAccount = async (userId: string) => {
  try {
    const response = await apiService.patch(`/users/${userId}/ban`);
    return response;
  } catch (error) {
    throw error;
  }
};
