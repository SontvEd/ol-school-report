import { google } from 'googleapis';
import { unstable_noStore as noStore } from 'next/cache';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function getSheetData(sheetName = 'Trường') {
  noStore(); // Luôn fetch mới, không dùng cache

  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return [];

    const headers = rows[1];
    const data = rows.slice(2).map(row =>
      headers.reduce((obj: Record<string, string>, header: string, index: number) => {
        obj[header] = row[index] ?? '';
        return obj;
      }, {})
    );

    return data;
  } catch (err) {
    console.error('Lỗi lấy dữ liệu từ Google Sheets:', err);
    throw new Error('Không thể lấy dữ liệu từ Google Sheets');
  }
}