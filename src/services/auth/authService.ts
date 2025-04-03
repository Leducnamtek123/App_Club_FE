import apiService, { API_BASE_URL } from "@/lib/api/api";
import { RefreshTokenResponse } from "@/lib/model/type";


export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    const { data } = await apiService.post(
      `${API_BASE_URL}auth/refresh-token`,
      { refreshToken },
    );
    return data;
  } catch (error: any) {
    console.error("🔍 Refresh token request failed:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
