import axios from "axios";
import { RefreshTokenResponse } from "../model/type";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

// Interceptor để log cURL request
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

let refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;

const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    const { data } = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}auth/refresh-token`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
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

const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem("expiresIn");
  if (!expiresAt) return true;
  return Date.now() >= parseInt(expiresAt, 10);
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      if (isTokenExpired()) {
        console.log("🔍 Token expired, refreshing...");
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken(refreshToken)
            .then((data) => {
              localStorage.setItem("accessToken", data.accessToken);
              localStorage.setItem("refreshToken", data.refreshToken);
              const expiresAt = Date.now() + data.expiresIn * 1000;
              localStorage.setItem("expiresIn", expiresAt.toString());
              return data;
            })
            .catch((error) => {
              console.error("🔍 Refresh token failed:", error);
              localStorage.clear();
              window.location.href = "/login";
              throw error;
            })
            .finally(() => {
              refreshTokenPromise = null;
            });
        }
        await refreshTokenPromise;
      }

      // Set Authorization header mỗi lần request
      config.headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

interface RequestOptions {
  contentType?: "application/json" | "multipart/form-data";
}

// Hàm xử lý request có refresh token tự động
const handleRequestWithRefresh = async <T>(
  requestFn: () => Promise<T>
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      if (!refreshTokenPromise) {
        console.log("🔍 Starting new refresh token process with:", refreshToken);
        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data) => {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            const expiresAt = Date.now() + data.expiresIn * 1000;
            localStorage.setItem("expiresIn", expiresAt.toString());
            return data;
          })
          .catch((refreshError) => {
            console.error("🔍 Refresh token failed:", refreshError);
            localStorage.clear();
            window.location.href = "/login";
            throw refreshError;
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      } else {
        console.log("🔍 Waiting for existing refresh token process");
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
      headers: options.contentType ? { "Content-Type": options.contentType } : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.get(url, config).then((res) => res.data));
  },

  post: async (url: string, data?: any, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType ? { "Content-Type": options.contentType } : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.post(url, data, config).then((res) => res.data));
  },

  put: async (url: string, data: any, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType ? { "Content-Type": options.contentType } : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.put(url, data, config).then((res) => res.data));
  },

  patch: async (url: string, data?: any, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType ? { "Content-Type": options.contentType } : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.patch(url, data, config).then((res) => res.data));
  },

  delete: async (url: string, options: RequestOptions = {}) => {
    const config = {
      headers: options.contentType ? { "Content-Type": options.contentType } : undefined,
    };
    return handleRequestWithRefresh(() => axiosInstance.delete(url, config).then((res) => res.data));
  },
};

export default apiService;
