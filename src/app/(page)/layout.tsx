"use client";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import React, { useState } from "react";

export default function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <section className="min-h-screen w-screen flex overflow-auto">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
        style={{ zIndex: 1000 }}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col w-full transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`} // Adjust margin-left dynamically
      >
        <Topbar />
        <div className="p-10 flex-1 bg-gray-100 w-auto">{children}</div>
      </div>
    </section>
  );
}
