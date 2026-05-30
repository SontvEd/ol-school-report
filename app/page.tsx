// app/page.tsx
import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";
import { Box, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import ReportClient from "./components/ReportClient";
import type { School, RetentionStatus } from "./components/ReportClient";

export const revalidate = 0;

// ─── Mapping helpers ──────────────────────────────────────────────────────────

/** Chuẩn hoá label trạng thái từ sheet → RetentionStatus enum */
const STATUS_MAP: Record<string, RetentionStatus> = {
  "Đăng ký mới":      "new",
  "Gia hạn":          "renew",
  "Tốt nghiệp":       "graduated",
  "Chưa triển khai":  "not_started",
  "Hủy":              "cancelled",
};

/** Chuẩn hoá mã cấp học số → chuỗi hiển thị */
const SCHOOL_LEVEL_MAP: Record<string, string> = {
  "1": "Tiểu học",
  "2": "THCS",
  "3": "THPT",
  "4": "Liên cấp",
};

/** Chuẩn hoá period "23-24" → "2023-2024" nếu cần */
function normalizePeriod(raw: string): string {
  // Đã là dạng đầy đủ
  if (/^\d{4}-\d{4}$/.test(raw)) return raw;
  // Dạng rút gọn "23-24" → "2023-2024"
  const m = raw.match(/^(\d{2})-(\d{2})$/);
  if (m) return `20${m[1]}-20${m[2]}`;
  return raw;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

async function Home() {
  // 1. Fetch song song hai sheet chính
  const [retentionRows, schoolRows, settingsRows] = await Promise.all([
    getSheetData("RetentionSchools", { headerRow: 1, startRow: 2 }).catch(() => [] as any[]),
    getSheetData("Schools",          { headerRow: 1, startRow: 2 }).catch(() => [] as any[]),
    getSheetData("0. Setting",       { headerRow: 1, startRow: 2 }).catch(() => [] as any[]),
  ]);

  // 2. Build lookup: schoolId → school info
  const schoolInfoMap: Record<string, {
    schoolName: string;
    area: string;
    province: string;
    ward: string;
    schoolLevel: string;
    businessName: string;
  }> = {};

  for (const row of schoolRows as any[]) {
    const id = String(row["schoolId"] ?? "").trim();
    if (!id) continue;
    schoolInfoMap[id] = {
      schoolName:   row["schoolName"]  ?? "",
      area:         row["area"]        ?? "",
      province:     row["province"]    ?? "",
      ward:         row["ward"]        ?? "",
      schoolLevel:  SCHOOL_LEVEL_MAP[String(row["schoolLevel"]).trim()] ?? row["schoolLevel"] ?? "",
      businessName: row["business"]    ?? "",
    };
  }

  // 3. Group retention rows by schoolId
  type RawPeriodEntry = {
    period: string;
    status: RetentionStatus;
    students: number;
    newStudents: number;
    renewed: number;
    graduated: number;
    cancelled: number;
  };

  const retentionBySchool: Record<string, RawPeriodEntry[]> = {};

  for (const row of retentionRows as any[]) {
    const id = String(row["schoolId"] ?? "").trim();
    if (!id) continue;

    const period = normalizePeriod(String(row["period"] ?? "").trim());
    // Bỏ qua dòng "Tất cả" — tính lại phía client nếu cần
    if (period.toLowerCase() === "tất cả" || period.toLowerCase() === "tat ca") continue;

    const status = STATUS_MAP[String(row["status"] ?? "").trim()] ?? "not_started";

    if (!retentionBySchool[id]) retentionBySchool[id] = [];
    retentionBySchool[id].push({
      period,
      status,
      students:    Number(row["students"]    || 0),
      newStudents: Number(row["newStudents"] || 0),
      renewed:     Number(row["renewed"]     || 0),
      graduated:   Number(row["graduated"]   || 0),
      cancelled:   Number(row["cancelled"]   || 0),
    });
  }

  // 4. Build School[] — merge info + retention periods
  const schools: School[] = Object.entries(retentionBySchool).map(([id, entries]) => {
    const info = schoolInfoMap[id] ?? {
      schoolName:   `Trường ${id}`,
      area:         "",
      province:     "",
      ward:         "",
      schoolLevel:  "",
      businessName: "",
    };

    const periods: School["periods"] = {};
    for (const e of entries) {
      periods[e.period] = {
        students:    e.students,
        status:      e.status,
        newStudents: e.newStudents,
        renewed:     e.renewed,
        graduated:   e.graduated,
        cancelled:   e.cancelled,
      };
    }

    return {
      id,
      schoolName:   info.schoolName,
      area:         info.area,
      province:     info.province,
      ward:         info.ward,
      schoolLevel:  info.schoolLevel,
      businessName: info.businessName,
      periods,
    };
  });

  // 5. Derive filter options
  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr.filter(Boolean)));

  // Periods từ Setting sheet, fallback sang tự suy từ dữ liệu
  const periodsFromSettings = uniq(
    (settingsRows as any[]).map((r: any) => normalizePeriod(String(r["Giai đoạn"] ?? "").trim()))
  );
  const periodsFromData = uniq(
    schools.flatMap(s => Object.keys(s.periods))
  ).sort();
  const periods = periodsFromSettings.length ? periodsFromSettings : periodsFromData;

  const areas         = uniq((settingsRows as any[]).map((r: any) => r["Khu vực"]   ?? "").filter(Boolean));
  const businesses    = uniq((settingsRows as any[]).map((r: any) => r["Kinh doanh"] ?? "").filter(Boolean));
  const schoolLevels  = uniq((settingsRows as any[]).map((r: any) => r["Cấp học"]   ?? "").filter(Boolean));

  // Fallback: lấy từ dữ liệu trường nếu Setting thiếu
  const finalAreas        = areas.length       ? areas        : uniq(schools.map(s => s.area));
  const finalBusinesses   = businesses.length  ? businesses   : uniq(schools.map(s => s.businessName));
  const finalSchoolLevels = schoolLevels.length ? schoolLevels : uniq(schools.map(s => s.schoolLevel));

  return (
    <Suspense
      fallback={
        <Box mih="100vh" bg="gray.0" py="xl">
          <Stack gap="lg" px="md" maw={1200} mx="auto">
            <Skeleton height={80} radius="md" />
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={120} radius="md" />
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      }
    >
      <ReportClient
        schools={schools}
        initialPeriods={periods as string[]}
        initialAreas={finalAreas as string[]}
        initialBusinesses={finalBusinesses as string[]}
        initialSchoolLevels={finalSchoolLevels as string[]}
      />
    </Suspense>
  );
}

export default Home;
