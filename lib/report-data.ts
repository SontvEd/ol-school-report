export type RetentionStatus =
    | "new"
    | "renew"
    | "graduated"
    | "not_started"
    | "cancelled";

export interface SchoolPeriodData {
    students: number;
    status: RetentionStatus;
    newStudents?: number;
    renewed?: number;
    graduated?: number;
    cancelled?: number;
}

export interface School {
    id: string;
    schoolName: string;
    area: string;
    province: string;
    ward: string;
    schoolLevel: string;
    businessName: string;
    periods: Record<string, SchoolPeriodData>;
}

export type SheetRow = Record<string, string | number | undefined>;

export const DEFAULT_PERIODS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];

export const STATUS_LABELS: Record<RetentionStatus, string> = {
    new: "Mới",
    renew: "Gia hạn",
    graduated: "Tốt nghiệp",
    not_started: "Chưa triển khai",
    cancelled: "Hủy",
};

export const STATUS_COLORS: Record<RetentionStatus, string> = {
    new: "green",
    renew: "blue",
    graduated: "violet",
    not_started: "yellow",
    cancelled: "red",
};

export const SCHOOL_LEVEL_COLOR: Record<string, string> = {
    THPT: "blue",
    THCS: "yellow",
    "Tiểu học": "green",
    "Liên cấp": "violet",
};

export function stripDiacritics(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function calcRetentionPercent(current: number, previous: number | undefined): string | null {
    if (previous === undefined || previous === 0) return null;
    return `${Math.round((current / previous) * 100)}%`;
}

export function getRetentionColor(pct: number): string {
    if (pct >= 100) return "green";
    if (pct >= 80) return "blue";
    if (pct >= 60) return "yellow";
    return "red";
}

export function pickValue(row: SheetRow, keys: string[]) {
    for (const key of keys) {
        const value = row[key];
        if (value && String(value).trim()) return String(value).trim();
    }
    return "";
}

export function normalizeRetentionStatus(value: string): RetentionStatus {
    const normalized = stripDiacritics(value);
    if (normalized.includes("dang ky moi") || normalized.startsWith("dang")) return "new";
    if (normalized.includes("gia han") || normalized.startsWith("gia")) return "renew";
    if (normalized.includes("tot nghiep")) return "graduated";
    if (normalized.includes("chua trien khai") || normalized.includes("chua")) return "not_started";
    if (normalized.includes("huy")) return "cancelled";
    return "not_started";
}

type AggregateRow = {
    [key: string]: string | number;
    moi: number;
    giaHan: number;
    totNghiep: number;
    chuaTrienKhai: number;
    huy: number;
    tong: number;
};

export function getSchoolSummaryRows(rows: SheetRow[]) {
    return (Array.isArray(rows) ? rows : []).filter((row: SheetRow) => {
        const period = pickValue(row, ["period", "Giai đoạn", "kỳ", "Kỳ"]);
        return stripDiacritics(period) === "tat ca";
    });
}

export function normalizeRetentionRows(rows: SheetRow[], periods: string[]) {
    const retentionMap = new Map<string, Partial<Record<string, SchoolPeriodData>>>();

    if (!Array.isArray(rows)) return retentionMap;

    const periodAliases = new Map<string, string>();
    periods.forEach(period => {
        const compact = stripDiacritics(period).replace(/\s+/g, "");
        periodAliases.set(compact, period);

        const fullMatch = period.match(/^(\d{4})-(\d{4})$/);
        if (fullMatch) {
            const shortKey = `${fullMatch[1].slice(2)}-${fullMatch[2].slice(2)}`;
            periodAliases.set(stripDiacritics(shortKey).replace(/\s+/g, ""), period);
        }

        const shortMatch = period.match(/^(\d{2})-(\d{2})$/);
        if (shortMatch) {
            const fullKey = `20${shortMatch[1]}-20${shortMatch[2]}`;
            periodAliases.set(stripDiacritics(fullKey).replace(/\s+/g, ""), period);
        }
    });

    rows.forEach((row: SheetRow) => {
        const schoolId = pickValue(row, ["schoolId", "schoolid", "ID trường (ôn luyện)", "ID trường", "id", "Mã trường"]);
        const rawPeriod = pickValue(row, ["period", "giai đoạn", "Giai đoạn", "kỳ", "Kỳ"]);
        if (!schoolId || !rawPeriod) return;

        const compactPeriod = stripDiacritics(rawPeriod).replace(/\s+/g, "");
        const isSummaryRow = compactPeriod === "tatca";
        const normalizedPeriod = isSummaryRow ? "Tất cả" : periodAliases.get(compactPeriod);
        if (!normalizedPeriod) return;

        const periodData: SchoolPeriodData = {
            students: Number(row.students ?? row["students"] ?? 0) || 0,
            status: normalizeRetentionStatus(String(row.status ?? row["status"] ?? "")),
            newStudents: Number(row.newStudents ?? row["newStudents"] ?? 0) || 0,
            renewed: Number(row.renewed ?? row["renewed"] ?? 0) || 0,
            graduated: Number(row.graduated ?? row["graduated"] ?? 0) || 0,
            cancelled: Number(row.cancelled ?? row["cancelled"] ?? 0) || 0,
        };

        const current = retentionMap.get(schoolId) ?? {};
        current[normalizedPeriod] = periodData;
        retentionMap.set(schoolId, current);
    });

    return retentionMap;
}

export function normalizeSchools(rows: SheetRow[], retentionRows: SheetRow[], periods: string[]): School[] {
    if (!Array.isArray(rows)) return [];

    const retentionMap = normalizeRetentionRows(retentionRows, periods);

    return rows
        .map((row: SheetRow, index: number) => {
            const id = pickValue(row, ["ID trường (ôn luyện)", "ID trường", "id", "Mã trường"]);
            const schoolName = pickValue(row, ["Tên trường", "schoolName", "Trường"]);
            if (!schoolName && !id) return null;

            const periodsData = periods.reduce<Record<string, SchoolPeriodData>>((acc, period) => {
                acc[period] = retentionMap.get(id)?.[period] ?? { students: 0, status: "not_started" };
                return acc;
            }, {});

            return {
                id: id || `row-${index + 1}`,
                schoolName,
                area: pickValue(row, ["Khu vực", "area"]),
                province: pickValue(row, ["Tỉnh cũ", "Tỉnh", "province"]),
                ward: pickValue(row, ["Xã/phường", "ward"]),
                schoolLevel: pickValue(row, ["Cấp học", "schoolLevel"]),
                businessName: pickValue(row, ["Kinh doanh", "businessName"]),
                periods: periodsData,
            } as School;
        })
        .filter((school): school is School => Boolean(school));
}

export function aggregateSchoolsByPeriod(schools: School[], period: string): AggregateRow {
    const aggregate: AggregateRow = {
        period,
        moi: 0,
        giaHan: 0,
        totNghiep: 0,
        chuaTrienKhai: 0,
        huy: 0,
        tong: 0,
    };

    schools.forEach(school => {
        const periodData = school.periods[period];
        if (!periodData) return;
        aggregate.tong += 1;
        if (periodData.status === "new") aggregate.moi += 1;
        else if (periodData.status === "renew") aggregate.giaHan += 1;
        else if (periodData.status === "graduated") aggregate.totNghiep += 1;
        else if (periodData.status === "not_started") aggregate.chuaTrienKhai += 1;
        else if (periodData.status === "cancelled") aggregate.huy += 1;
    });

    return aggregate;
}

export function aggregateSchoolsByGroup(
    schools: School[],
    period: string,
    groupKey: "area" | "businessName" | "schoolLevel",
    labelKey: string,
) {
    const grouped = new Map<string, AggregateRow>();

    schools.forEach(school => {
        const periodData = school.periods[period];
        if (!periodData) return;
        const label = school[groupKey] || "Khác";
        const current = grouped.get(label) ?? {
            [labelKey]: label,
            moi: 0,
            giaHan: 0,
            totNghiep: 0,
            chuaTrienKhai: 0,
            huy: 0,
            tong: 0,
        } as AggregateRow;

        current.tong += 1;
        if (periodData.status === "new") current.moi += 1;
        else if (periodData.status === "renew") current.giaHan += 1;
        else if (periodData.status === "graduated") current.totNghiep += 1;
        else if (periodData.status === "not_started") current.chuaTrienKhai += 1;
        else if (periodData.status === "cancelled") current.huy += 1;

        grouped.set(label, current);
    });

    return Array.from(grouped.values());
}
