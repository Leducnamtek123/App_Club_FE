import axiosInstance, {  API_BASE_URL } from "@/lib/api/api";
import { RefreshTokenResponse } from "@/lib/model/type";
import axios from "axios";

export interface LoginResponse {
  user: {
    role?: string;
    [key: string]: any;
  };
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: string; // Thêm expiresIn nếu API trả về
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post("/auth/login", { email, password });
    const user = response.data.user;

    // Lưu user và token vào localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", response.data.token.accessToken);
    localStorage.setItem("refreshToken", response.data.token.refreshToken);
    
    // Lưu expiresIn nếu có
    if (response.data.token.expiresIn) {
      localStorage.setItem("expiresIn", response.data.token.expiresIn);
    }

    // Lưu role vào cookie
    if (user.role) {
      document.cookie = `role=${encodeURIComponent(user.role)}; path=/; max-age=${60 * 60 * 24}`; // 1 ngày
    }

    return response.data;
  } catch (error: any) {
    // Ném lỗi chi tiết hơn nếu API trả về thông tin
    const errorMessage = error.response?.data?.message || "Đăng nhập thất bại!";
    throw new Error(errorMessage);
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expiresIn");
  localStorage.removeItem("selectedEvent");
  document.cookie = "role=; path=/; max-age=0";
  window.location.href = "/login";
};


export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const { data } = await axios.post(
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