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

// Interceptor để log cURL request (giữ nguyên)
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
      formDataStr += `${key}=${
        value instanceof File ? `[File: ${value.name}]` : value
      }; `;
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

// Biến global để theo dõi refresh token
let refreshTokenPromise: Promise<RefreshTokenResponse> | null = null;

// Hàm refresh token
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

// Request Interceptor - Thêm accessToken vào header nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Không tự động refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

interface RequestOptions {
  contentType?: "application/json" | "multipart/form-data";
}

// Hàm xử lý refresh token và retry request với đồng bộ
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

      // Nếu chưa có refresh token đang chạy, tạo mới
      if (!refreshTokenPromise) {
        console.log("🔍 Starting new refresh token process with:", refreshToken);
        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data) => {
            // Cập nhật token ngay lập tức
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.accessToken}`;
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            console.log("🔍 Refresh token success:", data);
            return data;
          })
          .catch((refreshError) => {
            console.error("🔍 Refresh token failed:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            throw refreshError;
          })
          .finally(() => {
            // Reset promise sau khi hoàn tất
            refreshTokenPromise = null;
          });
      } else {
        console.log("🔍 Waiting for existing refresh token process");
      }

      // Chờ refresh token hoàn tất và thử lại request
      const refreshedData = await refreshTokenPromise;
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
