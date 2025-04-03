"use client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import React from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider locale="vi-VN">
      <ToastProvider
        toastProps={{
          variant: "bordered",
          timeout: 3000,
          shouldShowTimeoutProgess:true,
          classNames: {
            closeButton:
              "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
          },
        }}
      />
      {children}
    </HeroUIProvider>
  );
}
