//import apiService from "@/lib/api/axiosInstance";

import apiService from "@/lib/api/api";

export const login = async (email: string, password: string) => {
  try {
    const response = await apiService.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("accessToken",response.token.accessToken);
    localStorage.setItem("refreshToken", response.token.refreshToken);
    return response;
  } catch (error: any) {
    throw "Đăng nhập thất bại!";
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};
