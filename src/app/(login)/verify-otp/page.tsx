"use client";
import OTPForm from "@/components/ui/auth/OTPForm";
import { Card } from "@heroui/react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center select-none">
      <Card className="text-center mb-6 min-w-1/4 p-10">
        <h2 className="font-bold text-4xl mb-4">Verify OTP</h2>
        <p className="text-lg font-normal text-gray-600">
          Insert the OTP that has been sent to your email.
        </p>
        <OTPForm />
      </Card>
    </div>
  );
}
