import { google } from 'googleapis';
import { unstable_noStore as noStore } from 'next/cache';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function getSheetData(
  sheetName = 'Trường',
  opts?: { headerRow?: number; startRow?: number; range?: string }
) {
  noStore(); // Luôn fetch mới, không dùng cache

  const headerRow = opts?.headerRow ?? 2; 
  const startRow = opts?.startRow ?? headerRow + 1;
  const range = opts?.range ?? `${sheetName}!A:Z`;

  try {
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    // nếu không đủ dòng để lấy header thì trả về rỗng
    if (rows.length < headerRow) return [];

    const headers = rows[headerRow - 1]; // chuyển sang 0-based
    const dataRows = rows.slice(Math.max(0, startRow - 1));

    const data = dataRows.map(row =>
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