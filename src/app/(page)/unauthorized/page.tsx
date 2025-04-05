import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex  justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md h-fit text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Không có quyền truy cập
        </h2>
        <p className="text-gray-600 mb-6">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
          viên nếu bạn nghĩ đây là lỗi.
        </p>
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Quay lại trang chủ
          </button>
        </Link>
      </div>
    </div>
  );
}