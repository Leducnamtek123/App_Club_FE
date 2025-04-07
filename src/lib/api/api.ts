import axios from "axios";
import { RefreshTokenResponse } from "@/lib/model/type";
import { logout, refreshAccessToken } from "@/services/login/authServices";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Lấy token từ localStorage
const getAccessToken = (): string => {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

// Interceptor yêu cầu: Thêm Authorization header vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(new Error(error.message))
);

let isRefreshing = false;
let refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;

// Xử lý lỗi response 401 và thực hiện refresh token
axiosInstance.interceptors.response.use(
  (response) => response, // Trả về response nếu không có lỗi
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi là 401 và chưa thực hiện refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Lấy refresh token từ localStorage
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.log("No refresh token available, logging out");
        logout(); // Nếu không có refresh token thì logout
        return Promise.reject(error);
      }

      // Nếu chưa có refresh token request đang chạy, bắt đầu gọi refresh token
      if (!isRefreshing) {
        console.log("Refreshing token...");
        isRefreshing = true;
        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data) => {
            const newAccessToken = data.accessToken;
            localStorage.setItem("accessToken", newAccessToken); // Lưu access token mới vào localStorage
            localStorage.setItem("refreshToken", data.refreshToken); // Lưu refresh token mới vào localStorage

            // Cập nhật authorization header cho tất cả request sau
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return data;
          })
          .catch((refreshError) => {
            console.error("Refresh token failed:", refreshError);
            logout(); // Nếu refresh token không thành công, logout
            return Promise.reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false; // Reset trạng thái refresh
            refreshTokenPromise = null; // Reset promise refresh
          });

        // Sau khi refresh token thành công, retry lại request gốc
        return refreshTokenPromise.then(() => axiosInstance(originalRequest));
      }

      // Nếu đã có request refresh token đang chạy, chờ đến khi hoàn tất
      return refreshTokenPromise?.then(() => axiosInstance(originalRequest));
    }

    // Xử lý các lỗi khác (không phải 401)
    const errorMessage =
      error.response?.data?.message ||
      (error.request ? "Không có phản hồi từ server!" : error.message);
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
