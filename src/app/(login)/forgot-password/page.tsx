"use client";
import ForgotForm from "@/components/ui/auth/ForgotForm";
import { Card } from "@heroui/react";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center select-none">
    <Card className="text-center mb-6 min-w-1/4 p-10">
      <h2 className="font-bold text-4xl mb-4">Forgot Password</h2>
      <p className="text-lg font-normal text-gray-600">
        Enter your email to recovery your password
      </p>
    <ForgotForm />
    </Card>
  </div>
  );
}
