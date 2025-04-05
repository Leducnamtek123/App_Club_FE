"use client";

import BranchForm from "@/components/ui/management/Branchform";
import MembershipFee from "@/components/ui/management/YearMembershipFee";
import TitleManagement from "@/components/ui/management/Title";
import SponsorBenefit from "@/components/ui/management/SponsorBenefit";

export default function ManagementPage() {
  // Lấy thông tin user từ localStorage
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsedUser = userRole ? JSON.parse(userRole) : null;
  const role = parsedUser?.role;

  // Kiểm tra xem có phải ADMIN không
  const isAdmin = role === "ADMIN";

  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <p className="font-bold text-2xl mb-4">Trang Quản Lý</p>

        <div className="w-full bg-white p-5 border border-gray-300 shadow-lg rounded-lg grid grid-cols-2 gap-5">
          {/* Ẩn BranchForm nếu là ADMIN */}
          {!isAdmin && (
            <div className="w-full">
              <BranchForm />
            </div>
          )}
          {/* Ẩn SponsorBenefit nếu là ADMIN */}
          {!isAdmin && (
            <div className="w-full">
              <SponsorBenefit />
            </div>
          )}
          {!isAdmin && (
            <div className="w-full">
              <MembershipFee />
            </div>
          )}
          <div className="w-full ">
            <TitleManagement />
          </div>
        </div>
      </div>
    </section>
  );
}
