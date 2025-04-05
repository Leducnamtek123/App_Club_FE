import apiService from "@/lib/api/api";

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
    const response = await apiService.post("/auth/login", { email, password });
    const user = response.user;

    // Lưu user và token vào localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", response.token.accessToken);
    localStorage.setItem("refreshToken", response.token.refreshToken);
    
    // Lưu expiresIn nếu có
    if (response.token.expiresIn) {
      localStorage.setItem("expiresIn", response.token.expiresIn);
    }

    // Lưu role vào cookie
    if (user.role) {
      document.cookie = `role=${encodeURIComponent(user.role)}; path=/; max-age=${60 * 60 * 24}`; // 1 ngày
    }

    return response;
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
  localStorage.removeItem("expiresIn"); // Xóa expiresIn nếu đã lưu
  localStorage.removeItem("selectedEvent");
  document.cookie = "role=; path=/; max-age=0";
  window.location.href = "/login";
};