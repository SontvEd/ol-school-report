import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";
import RefreshButton from "./components/RefreshButton";

export const revalidate = 0; // Tắt cache trên Vercel

async function ReportContent() {
  const data = await getSheetData('Trường');

  const now = new Date();
  const vietnamTime = now.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Báo Cáo OL School</h1>
            <p className="text-gray-600 mt-2">
              Cập nhật tự động • Lần cuối: {vietnamTime}
            </p>
          </div>
          <RefreshButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-xl text-black">
                {item['Tên trường'] || item.Name || 'Không có tên'}
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {item['Tỉnh cũ'] || item.Revenue || '0'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20">Đang tải dữ liệu...</div>}>
      <ReportContent />
    </Suspense>
  );
}