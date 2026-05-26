import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";

async function ReportContent() {
  const data = await getSheetData();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-4 text-black">Báo Cáo Kinh Doanh</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-xl text-black">{item['Tên trường'] || item.Name}</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {item['Tỉnh cũ'] || item.Revenue}
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