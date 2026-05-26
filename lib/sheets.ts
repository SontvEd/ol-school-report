import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function getSheetData(sheetName = 'Trường') {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: `${sheetName}!A:Z`, // Điều chỉnh theo sheet của bạn
  });

  const rows = response.data.values || [];
  
  // Chuyển thành array object
  const headers = rows[1];
  const data = rows.slice(2).map(row => {
    return headers.reduce((obj: any, header: string, index: number) => {
      obj[header] = row[index] || '';
      return obj;
    }, {});
  });

  return data;
}