"use client";
import AdminReport from "@/components/ui/report/AdminReport";
import Report from "@/components/ui/report/Report";
import React from "react";

export default function Page() {
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;
  const isAdmin = role === "ADMIN";

  return <div>{isAdmin ? <AdminReport /> : <Report />}</div>;
}
