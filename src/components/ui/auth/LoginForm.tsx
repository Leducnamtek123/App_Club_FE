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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const validationErrors = validateForm(newEmail, password);
    setErrors((prev) => ({ ...prev, email: validationErrors.email }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const validationErrors = validateForm(email, newPassword);
    setErrors((prev) => ({ ...prev, password: validationErrors.password }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    setErrors({}); // Reset errors

    const validationErrors = validateForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
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
        {errors.general && (
          <p className="text-red-500 text-sm text-center">{errors.general}</p>
        )}

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
            onChange={handleEmailChange}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

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
            isInvalid={!!errors.password || errors.general === "Sai mật khẩu"}
            value={password}
            onChange={handlePasswordChange}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className={`font-bold uppercase text-xs rounded-lg w-full py-3 shadow-md ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-gray-900 text-white"
            }`}
        >
          {loading ? <CircularProgress aria-label="Loading.." size="md" /> : "Sign in"}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;