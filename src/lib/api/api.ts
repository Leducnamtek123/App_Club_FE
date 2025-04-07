import axios from "axios";
import { RefreshTokenResponse } from "../model/type";
import { refreshAccessToken } from "@/services/auth/authService";
import { logout } from "@/services/login/authServices";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

// Interceptor để log cURL request (debug)
axiosInstance.interceptors.request.use((config) => {
  const { method, url, headers, data, params } = config;
  let curl = `curl -X ${method?.toUpperCase()} '${API_BASE_URL}${url}'`;
  Object.entries(headers || {}).forEach(([key, value]) => {
    if (typeof value === "string") {
      curl += ` -H '${key}: ${value}'`;
    }
  });
  if (data instanceof FormData) {
    let formDataStr = "";
    for (const [key, value] of data.entries()) {
      formDataStr += `${key}=${value instanceof File ? `[File: ${value.name}]` : value}; `;
    }
    curl += ` --data '${formDataStr.trim()}'`;
  } else if (data) {
    curl += ` --data '${JSON.stringify(data)}'`;
  }
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    curl += `?${queryString}`;
  }
  console.log("🔍 cURL Request:", curl);
  return config;
});

// Global refresh token tracker
let refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu yêu cầu đã được thử lại

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (!refreshTokenPromise) {
        console.log("🔁 Refreshing token...");

        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data) => {
            const newExpiresAt = Date.now() + data.expiresIn * 1000;
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.accessToken}`;
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("expiresIn", newExpiresAt.toString());
            console.log("✅ Token refreshed");
            return data;
          })
          .catch((refreshError) => {
            logout();
            throw refreshError;
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      } else {
        console.log("⏳ Waiting for ongoing token refresh...");
      }

      await refreshTokenPromise;

      // Retry lại yêu cầu gốc với token mới
      const configRetry = error.config;
      configRetry.headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
      return axiosInstance(configRetry);
    }
    return Promise.reject(error);
  }
);

interface RequestOptions {
  contentType?: "application/json" | "multipart/form-data";
}

const handleRequestWithRefresh = async <T>(requestFn: () => Promise<T>): Promise<T> => {
  try {
    return await requestFn();
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      if (!refreshTokenPromise) {
        console.log("🔁 Refreshing token...");

        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data) => {
            const newExpiresAt = Date.now() + data.expiresIn * 1000;
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.accessToken}`;
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("expiresIn", newExpiresAt.toString());
            console.log("✅ Token refreshed in retry");
            return data;
          })
          .catch((refreshError) => {
            logout();
            throw refreshError;
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      } else {
        console.log("⏳ Waiting for ongoing token refresh...");
      }

      await refreshTokenPromise;
      return await requestFn();
    }
    throw error;
  }
};

const apiService = {
  get: async (url: string, params = {}, options: RequestOptions = {}) => {
    const config = {
      params,
      headers: options.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.get(url, config).then((res) => res.data));
  },

  post: async (url: string, data?: any, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.post(url, data, config).then((res) => res.data));
  },

  put: async (url: string, data: any, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.put(url, data, config).then((res) => res.data));
  },

  patch: async (url: string, data?: any, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.patch(url, data, config).then((res) => res.data));
  },

  delete: async (url: string, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType
        ? { "Content-Type": options.contentType }
        : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.delete(url, config).then((res) => res.data));
  },
};

export default apiService;
