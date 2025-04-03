"use client";

import BranchForm from "@/components/ui/management/Branchform";
import MembershipFee from "@/components/ui/management/YearMembershipFee";
import { Title } from "chart.js";

import TitleManagement from "@/components/ui/management/Title";

export default function ManagementPage() {
  return (
    <section className="flex justify-center z-0">
      <div className="w-full">
        <p className="font-bold text-2xl mb-4">Trang Quản Lý</p>

        <div className="w-full bg-white p-5 border border-gray-300 shadow-lg rounded-lg flex ">
          <div className="flex-1">
            <div className="w-full ps-5  pe-5">
              <BranchForm />
            </div>
            <div className="w-full p-5"></div>
          </div>
          <div className="flex-1 ">
            <div className="w-full ps-5  pe-5">
              <MembershipFee />
            </div>
            <div className="w-full p-5">
              <TitleManagement />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
