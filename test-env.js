// test-env.js
require('dotenv').config({ path: '.env.local' });

console.log("=== KIỂM TRA BIẾN MÔI TRƯỜNG ===");
console.log("Client Email:", process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? "✅ Có dữ liệu" : "❌ Không tìm thấy");
console.log("Private Key Length:", process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length || "❌ Không có");
console.log("Contains BEGIN PRIVATE KEY?", process.env.GOOGLE_SHEETS_PRIVATE_KEY?.includes("BEGIN PRIVATE KEY") ? "✅ Có" : "❌ Không");

if (process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
  console.log("Private Key bắt đầu bằng:", process.env.GOOGLE_SHEETS_PRIVATE_KEY.substring(0, 50) + "...");
}