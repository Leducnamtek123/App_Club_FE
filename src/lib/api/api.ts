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

// Hàm kiểm tra token có hết hạn hay không
const isTokenExpired = (): boolean => {
  const expiresIn = localStorage.getItem("expiresIn");
  if (!expiresIn) return true; // Nếu không có expiresIn, coi như hết hạn
  const expirationTime = new Date(expiresIn).getTime();
  return Date.now() >= expirationTime;
};

// Request Interceptor - Thêm accessToken và kiểm tra expiresIn
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      // Kiểm tra xem token có hết hạn không
      if (isTokenExpired()) {
        console.log("🔍 Token expired, refreshing...");
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken(refreshToken)
            .then((data) => {
              axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.accessToken}`;
              localStorage.setItem("accessToken", data.accessToken);
              localStorage.setItem("refreshToken", data.refreshToken);
              localStorage.setItem("expiresIn", data.expiresIn.toString()); // Giả sử API trả về expiresIn
              console.log("🔍 Refresh token success:", data);
              return data;
            })
            .catch((refreshError) => {
              console.error("🔍 Refresh token failed:", refreshError);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("expiresIn");
              localStorage.removeItem("user");
              window.location.href = "/login";
              throw refreshError;
            })
            .finally(() => {
              refreshTokenPromise = null;
            });
        }
        await refreshTokenPromise; // Chờ refresh hoàn tất
      }
      // Thêm accessToken vào header
      config.headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
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

      if (!refreshTokenPromise) {
        console.log("🔍 Starting new refresh token process with:", refreshToken);
        refreshTokenPromise = refreshAccessToken(refreshToken)
          .then((data) => {
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.accessToken}`;
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("expiresIn", data.expiresIn.toString()); // Giả sử API trả về expiresIn
            console.log("🔍 Refresh token success:", data);
            return data;
          })
          .catch((refreshError) => {
            console.error("🔍 Refresh token failed:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("expiresIn");
            localStorage.removeItem("user");
            window.location.href = "/login";
            throw refreshError;
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      } else {
        console.log("🔍 Waiting for existing refresh token process");
      }

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