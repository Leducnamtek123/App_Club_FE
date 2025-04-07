import axios from "axios";
import { RefreshTokenResponse } from "@/lib/model/type";
import { logout, refreshAccessToken } from "../../services/login/authServices";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Lấy access token từ localStorage
const getAccessToken = (): string => {
  return typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
};

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

// Cờ đánh dấu đang refresh token
let isRefreshing = false;

// Hàng đợi request bị 401
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}[] = [];

// Xử lý lại hàng đợi sau khi refresh xong
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thêm Authorization header vào mỗi request
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

// Xử lý response lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh thì chờ xong rồi retry
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      // Bắt đầu refresh token
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        refreshAccessToken(refreshToken)
          .then((data: RefreshTokenResponse) => {
            const newAccessToken = data.accessToken;
            const newRefreshToken = data.refreshToken;

            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            axiosInstance.defaults.headers["Authorization"] = "Bearer " + newAccessToken;
            originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

            processQueue(null, newAccessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            logout();
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Trả lỗi nếu không phải lỗi 401
    const errorMessage =
      error.response?.data?.message ||
      (error.request ? "Không có phản hồi từ server!" : error.message);
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
