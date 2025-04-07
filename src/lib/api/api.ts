import axios from "axios";
import { RefreshTokenResponse } from "@/lib/model/type";
import { logout, refreshAccessToken } from "../../services/login/authServices";

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

let isRefreshing = false;  // Trạng thái để tránh gọi refresh token nhiều lần
let refreshTokenPromise: Promise<any> | null = null;  // Promise đang đợi xử lý

// Interceptor request: Thêm access token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: Bắt lỗi 401 để xử lý refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.log("No refresh token available, logging out");
        logout();
        return Promise.reject(error);
      }

      // Nếu chưa có refresh đang chạy, bắt đầu gọi
      if (!isRefreshing) {
        console.log("Refreshing token...");
        isRefreshing = true;

        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data: RefreshTokenResponse) => {
            const newAccessToken = data.accessToken;
            const newRefreshToken = data.refreshToken;

            // Lưu token mới
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // Gắn token mới vào header
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${newAccessToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

            return axiosInstance(originalRequest); // ✅ retry lại request gốc
          })
          .catch((refreshError) => {
            console.error("Refresh token failed:", refreshError);
            logout();
            return Promise.reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
            refreshTokenPromise = null;
          });

        return refreshTokenPromise;
      }

      // Nếu đang trong lúc refresh, chờ nó xong rồi retry lại request
      return refreshTokenPromise?.then(() => {
        const accessToken = getAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      });
    }

    // Lỗi khác
    const errorMessage =
      error.response?.data?.message ||
      (error.request ? "Không có phản hồi từ server!" : error.message);
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
