"use client";

import { login } from "@/services/login/authServices";
import { Button, CircularProgress, Form, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ general?: string; email?: string; password?: string }>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const validateForm = (email: string, password: string) => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải dài ít nhất 6 ký tự";
    }
    return newErrors;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Ngăn reload mặc định của form
    setLoading(true);
    setErrors({});

    // Kiểm tra dữ liệu đầu vào
    const validationErrors = validateForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data?.token);
      router.push("/dashboard"); // Chỉ chuyển hướng khi thành công
    } catch (err: any) {
      console.log("Login error:", err.response);

      let errorMessage = "Đã xảy ra lỗi khi đăng nhập";
      if (err.response?.status === 401) {
        errorMessage = "Sai mật khẩu";
      } else if (err.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ";
      } else {
        errorMessage = err.message || errorMessage;
      }

      setErrors({ general: errorMessage });
      setEmail("");
      setPassword("");
      setTimeout(() => setErrors({}), 10000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      className="mt-8 mb-2 mx-auto flex flex-col items-center w-full max-w-lg px-6 sm:px-4"
      onSubmit={onSubmit}
    >
      <div className="w-full flex flex-col gap-6">
        {/* Hiển thị thông báo lỗi chung */}
        {errors.general && (
          <p className="text-red-500 text-sm text-center">{errors.general}</p>
        )}

        {/* Email Input */}
        <div>
          <Input
            type="email"
            size="lg"
            radius="sm"
            variant="bordered"
            placeholder="name@mail.com"
            label="Your email"
            name="email"
            labelPlacement="outside"
            className="text-sm font-normal w-full"
            required
            isInvalid={!!errors.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password Input */}
        <div>
          <Input
            isClearable
            size="lg"
            radius="sm"
            variant="bordered"
            type="password"
            label="Password"
            name="password"
            labelPlacement="outside"
            placeholder="********"
            className="text-sm font-normal w-full"
            required
            isInvalid={!!errors.password || (errors.general === "Sai mật khẩu")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className={`font-bold uppercase text-xs rounded-lg w-full py-3 shadow-md ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-gray-900 text-white"
          }`}
        >
          {loading ? <CircularProgress aria-label="Loading.." size="md" /> : "Sign in"}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
