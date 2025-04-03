"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronDown, FaBars, FaChartBar } from "react-icons/fa";
import {
  MdEvent,
  MdNotifications,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { PiUsersThree } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { useState, useEffect } from "react";
import { BsNewspaper } from "react-icons/bs";
import { La_Belle_Aurore } from "next/font/google";
import { heroui } from "@heroui/react";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (menu: string) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  // Theo dõi kích thước màn hình và tự động thu nhỏ sidebar khi màn hình nhỏ
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false); // Thu nhỏ sidebar khi width < 768
      } else {
        setIsSidebarOpen(true); // Mở sidebar khi ở màn hình lớn
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  const menuItems = [
    { label: "Trang chủ", href: "/dashboard", icon: <RxDashboard size={24} /> },
    {
      label: "Hội Viên",
      href: "/membership",
      icon: <PiUsersThree size={24} />,
      subMenu: [
        { label: "Danh sách", href: "/membership/list" },
        { label: "Xét duyệt", href: "/membership/approval" },
        { label: "Lịch sử hội phí", href: "/membership/fee" },
      ],
    },
    { label: "Sự Kiện", href: "/event", icon: <MdEvent size={24} /> },
    { label: "Tin tức", href: "/news", icon: <BsNewspaper size={24} /> },
    {
      label: "Báo cáo",
      href: "/report",
      icon: <FaChartBar size={24} />,
    },
    {
      label: "Quản Lý",
      href: "/management",
      icon: <MdOutlineManageAccounts size={24} />,
      subMenu: [
        { label: "Chung", href: "/management/general" },
        { label: "Chi hội trưởng", href: "/management/branch-leader" },
        { label: "Giới thiệu", href: "/management/introduction" },
      ],
    },
  ];

  const handleMenuClick = (itemHref: string) => {
    // Nếu sidebar đang thu nhỏ, mở sidebar và mở submenu
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setOpenSubMenu(itemHref); // Mở submenu khi sidebar mở
    } else {
      // Nếu sidebar đang mở, chỉ cần mở submenu mà không thay đổi sidebar
      toggleSubMenu(itemHref);
    }
  };

  return (
    <>
      {/* Nút mở Sidebar trên Mobile & DevTools */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white shadow-lg rounded-full md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FaBars size={24} />
      </button>

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r flex flex-col transition-all duration-300 z-40 ${
          isSidebarOpen ? "w-64" : "w-16"
        } md:relative`}
        style={{ flexShrink: 0 }}
      >
        {/* Header Sidebar */}
        <div className="p-4 flex items-center justify-between h-16">
          {isSidebarOpen && (
            <p className="text-gray-900 font-bold text-2xl">Dashboard</p>
          )}

          {/* Nút đóng/mở Sidebar (Hiển thị trên Desktop luôn) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:block hidden"
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <div key={item.href} className="mb-2">
                {item.subMenu ? (
                  <button
                    className="flex items-center w-full p-4 rounded-lg transition-all duration-300 text-gray-800 font-medium hover:bg-gray-100"
                    onClick={() => handleMenuClick(item.href)} // Xử lý click mở submenu
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {item.icon}
                    </div>
                    {isSidebarOpen && (
                      <span className="ml-3">{item.label}</span>
                    )}
                    {isSidebarOpen && (
                      <motion.div
                        animate={{
                          rotate: openSubMenu === item.href ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="ml-auto"
                      >
                        <FaChevronDown size={14} />
                      </motion.div>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center p-4 w-full rounded-lg transition-all duration-300 font-medium hover:bg-gray-100 ${
                      isActive ? "text-blue-600 font-semibold" : "text-gray-800"
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {item.icon}
                    </div>
                    {isSidebarOpen && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </Link>
                )}
                {item.subMenu && isSidebarOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={
                      openSubMenu === item.href
                        ? { height: "auto", opacity: 1 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden ml-6"
                  >
                    {item.subMenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 py-2 mt-2 rounded-lg transition-all duration-300 hover:bg-gray-50 ${
                          pathname === subItem.href
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
}
