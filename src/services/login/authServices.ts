import apiService from "@/lib/api/api";

export const login = async (email: string, password: string) => {
  try {
    const response = await apiService.post("/auth/login", { email, password });
    const user = response.user;

    // Lưu user vào localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", response.token.accessToken);
    localStorage.setItem("refreshToken", response.token.refreshToken);
    
    if (user.role) {
      document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24}`; // Hết hạn sau 1 ngày
    }

    return response;
  } catch (error: any) {
    throw "Đăng nhập thất bại!";
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("selectedEvent");
  document.cookie = "role=; path=/; max-age=0";
  window.location.href = "/login";
};