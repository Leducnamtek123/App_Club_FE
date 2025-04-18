"use client";

import { Button, CircularProgress, Form, Input } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

const ForgotForm = () => {

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);
    setTimeout(() => {
      setLoading(false);
      router.push("/verify-otp"); // Điều hướng đến trang xác nhận OTP
    }, 1500);
  };

  return (
    <Form
      className="mt-8 mb-2 mx-auto flex flex-col items-center w-full max-w-lg px-6 sm:px-4"
      onSubmit={onSubmit}
    >
      <div className="w-full flex flex-col gap-6 ">
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
          errorMessage="Invalid email input."
        />
        <Button
          type="submit"
          disabled={loading}
          className="font-bold uppercase text-xs rounded-lg bg-gray-900 text-white shadow-md w-full py-3"
        >
          {loading ? (
            <CircularProgress aria-label="Loading.." size="md" />
          ) : (
            "Send OTP"
          )}
        </Button>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
          >
            <FaArrowLeft /> <span>Back to login</span>
          </Link>
        </div>
      </div>
    </Form>
  );
};

export default ForgotForm;
