"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Group,
    Image,
    Paper,
    Stack,
    Title,
    Text,
    SimpleGrid,
    Badge,
    Pill,
    Select,
    SegmentedControl,
    Table,
    TextInput,
    Divider,
    Pagination,
    Box,
    Button,
    Tooltip,
    Modal,
    Grid,
    RingProgress,
    Center,
    ThemeIcon,
    Alert,
} from "@mantine/core";
import { BarChart, DonutChart, LineChart } from "@mantine/charts";
import "@mantine/charts/styles.css";
import {
    IconArrowDown,
    IconArrowUp,
    IconBookmark,
    IconBriefcase,
    IconBuildingCommunity,
    IconBuildingMinus,
    IconBuildingPlus,
    IconBuildings,
    IconCalendar,
    IconClockCheck,
    IconEye,
    IconHomeHand,
    IconMapPin,
    IconSchool,
    IconSearch,
    IconTrendingUp,
    IconTrendingDown,
    IconMinus,
    IconAlertCircle,
} from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import RefreshButton from "./RefreshButton";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface StatItem {
    label: string;
    value: number;
    icon: React.FC<{ size?: number; color?: string }>;
    percent: string | null;
    trend: string | null;
    trendType: "up" | "down" | "neutral";
    accentColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const DEFAULT_PERIODS = ["Tất cả", "23-24", "24-25", "25-26"];

export const STATUS_LABELS: Record<RetentionStatus, string> = {
    new: "Mới",
    renew: "Gia hạn",
    graduated: "Tốt nghiệp",
    not_started: "Chưa triển khai",
    cancelled: "Hủy đăng ký",
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

const QUICK_FILTERS = [
    { label: "Trường", color: "blue", icon: IconBuildings },
    { label: "Học sinh", color: "green", icon: IconSchool },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcRetentionPercent(current: number, previous: number | undefined): string | null {
    if (previous === undefined || previous === 0) return null;
    return `${Math.round((current / previous) * 100)}%`;
}

function getRetentionColor(pct: number): string {
    if (pct >= 100) return "green";
    if (pct >= 80) return "blue";
    if (pct >= 60) return "yellow";
    return "red";
}

/** Tính stats động từ danh sách trường + kỳ được chọn */
function computeStats(schools: School[], activePeriod: string, allPeriods: string[]): StatItem[] {
    const isAllPeriod = activePeriod === "Tất cả";

    const prevPeriodIdx = allPeriods.indexOf(activePeriod) - 1;
    const prevPeriod = prevPeriodIdx >= 0 ? allPeriods[prevPeriodIdx] : null;

    let totalSchools = 0;
    let newCount = 0;
    let renewCount = 0;
    let notStarted = 0;
    let cancelled = 0;
    let totalStudents = 0;

    // Counts for previous period (for trend comparison)
    let prevNew = 0;
    let prevRenew = 0;

    for (const school of schools) {
        if (isAllPeriod) {
            let schoolHasAnyPeriod = false;

            const periodKeys = Object.keys(school.periods).sort();
            const lastPeriod = periodKeys.at(-1);

            for (const periodKey of periodKeys) {
                const pd = school.periods[periodKey];
                if (!pd) continue;

                schoolHasAnyPeriod = true;
                totalStudents += pd.students || 0;

                if (pd.status === "new") newCount++;
                if (pd.status === "renew") renewCount++;
                if (pd.status === "cancelled") cancelled++;
            }

            // not_started chỉ lấy ở kỳ cuối cùng
            if (lastPeriod) {
                const lastPd = school.periods[lastPeriod];

                if (lastPd?.status === "not_started") {
                    notStarted++;
                }
            }

            if (schoolHasAnyPeriod) {
                totalSchools++;
            }
        } else {
            // === XỬ LÝ MỘT KỲ CỤ THỂ ===
            const pd = school.periods[activePeriod];
            if (!pd) continue;

            totalSchools++;
            totalStudents += pd.students || 0;

            if (pd.status === "new") newCount++;
            if (pd.status === "renew") renewCount++;
            if (pd.status === "not_started") notStarted++;
            if (pd.status === "cancelled") cancelled++;
        }

        // Tính trend cho kỳ trước (chỉ áp dụng khi không phải "Tất cả")
        if (!isAllPeriod && prevPeriod) {
            const ppd = school.periods[prevPeriod];
            if (ppd?.status === "new") prevNew++;
            if (ppd?.status === "renew") prevRenew++;
        }
    }

    const fmtTrend = (cur: number, prev: number): { str: string; type: "up" | "down" | "neutral" } => {
        if (isAllPeriod || !prevPeriod || prev === 0) {
            return { str: "", type: "neutral" };
        }
        const d = cur - prev;
        return {
            str: `${d > 0 ? "+" : ""}${d}`,
            type: d > 0 ? "up" : d < 0 ? "down" : "neutral",
        };
    };

    const newTrend = fmtTrend(newCount, prevNew);
    const renewTrend = fmtTrend(renewCount, prevRenew);

    return [
        {
            label: "Tổng trường",
            value: totalSchools,
            icon: IconBuildings,
            percent: null,
            trend: null,
            trendType: "neutral",
            accentColor: "blue",
        },
        {
            label: "Đăng ký mới",
            value: newCount,
            icon: IconBuildingPlus,
            percent: totalSchools > 0 ? `${Math.round((newCount / totalSchools) * 100)}%` : null,
            trend: newTrend.str || null,
            trendType: newTrend.type,
            accentColor: "green",
        },
        {
            label: "Gia hạn",
            value: renewCount,
            icon: IconBuildingCommunity,
            percent: totalSchools > 0 ? `${Math.round((renewCount / totalSchools) * 100)}%` : null,
            trend: renewTrend.str || null,
            trendType: renewTrend.type,
            accentColor: "violet",
        },
        {
            label: "Chưa triển khai",
            value: notStarted,
            icon: IconHomeHand,
            percent: totalSchools > 0 ? `${Math.round((notStarted / totalSchools) * 100)}%` : null,
            trend: null,
            trendType: "neutral",
            accentColor: "yellow",
        },
        {
            label: "Hủy đăng ký",
            value: cancelled,
            icon: IconBuildingMinus,
            percent: totalSchools > 0 ? `${Math.round((cancelled / totalSchools) * 100)}%` : null,
            trend: null,
            trendType: "neutral",
            accentColor: "red",
        },
    ];
}

/** Tính chart data theo một chiều (period / area / business / schoolLevel) */
function computeChartData(
    schools: School[],
    activePeriod: string,
    allPeriods: string[],
    groupKey: "area" | "businessName" | "schoolLevel"
) {
    const isAllPeriod = activePeriod === "Tất cả";

    const groups: Record<string, School[]> = {};

    for (const s of schools) {
        const key = s[groupKey] || "Khác";
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
    }

    return Object.entries(groups).map(([key, groupSchools]) => {
        let moi = 0, giaHan = 0, chuaTrienKhai = 0, huy = 0;

        for (const s of groupSchools) {
            if (isAllPeriod) {
                // Tính tất cả các kỳ
                for (const p of allPeriods) {
                    const pd = s.periods[p];
                    if (!pd) continue;
                    if (pd.status === "new") moi++;
                    if (pd.status === "renew") giaHan++;
                    if (pd.status === "not_started") chuaTrienKhai++;
                    if (pd.status === "cancelled") huy++;
                }
            } else {
                // Chỉ tính 1 kỳ cụ thể
                const pd = s.periods[activePeriod];
                if (!pd) continue;
                if (pd.status === "new") moi++;
                if (pd.status === "renew") giaHan++;
                if (pd.status === "not_started") chuaTrienKhai++;
                if (pd.status === "cancelled") huy++;
            }
        }

        return {
            [groupKey === "area" ? "area" : groupKey === "businessName" ? "business" : "schoolLevel"]: key,
            moi,
            giaHan,
            chuaTrienKhai,
            huy,
        };
    });
}

/** Biểu đồ theo giai đoạn */
function computePeriodChartData(schools: School[], activePeriod: string, allPeriods: string[]) {
    const isAllPeriod = activePeriod === "Tất cả";

    if (!isAllPeriod) {
        // Chỉ 1 kỳ → trả về mảng 1 phần tử
        let moi = 0, giaHan = 0, chuaTrienKhai = 0, huy = 0;

        for (const s of schools) {
            const pd = s.periods[activePeriod];
            if (!pd) continue;
            if (pd.status === "new") moi++;
            if (pd.status === "renew") giaHan++;
            if (pd.status === "not_started") chuaTrienKhai++;
            if (pd.status === "cancelled") huy++;
        }

        return [{
            period: activePeriod,
            moi,
            giaHan,
            chuaTrienKhai,
            huy,
        }];
    }

    // "Tất cả" → tính theo từng kỳ
    return allPeriods
        .filter(period => period !== "Tất cả")   // Loại bỏ "Tất cả" nếu có trong mảng
        .map(period => {
            let moi = 0, giaHan = 0, chuaTrienKhai = 0, huy = 0;

            for (const s of schools) {
                const pd = s.periods[period];
                if (!pd) continue;

                if (pd.status === "new") moi++;
                if (pd.status === "renew") giaHan++;
                if (pd.status === "not_started") chuaTrienKhai++;
                if (pd.status === "cancelled") huy++;
            }

            return { period, moi, giaHan, chuaTrienKhai, huy };
        }
        );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ stat }: { stat: StatItem }) {
    const Icon = stat.icon;
    const TrendIcon =
        stat.trendType === "up" ? IconArrowUp :
            stat.trendType === "down" ? IconArrowDown : null;

    return (
        <Paper
            withBorder p="sm" radius="md"
            style={{ borderTop: `3px solid var(--mantine-color-${stat.accentColor}-5)` }}
        >
            <Stack gap={4}>
                <Group gap={6} align="center">
                    <Icon size={16} color={`var(--mantine-color-${stat.accentColor}-6)`} />
                    <Text size="sm" fw={500} c={`${stat.accentColor}.6`}>{stat.label}</Text>
                </Group>
                <Text size="xl" fw={700} c={`${stat.accentColor}.7`}>{stat.value.toLocaleString('vi-VN')}</Text>
                <Group justify="space-between" align="center">
                    {stat.percent ? (
                        <Pill size="xs" c={`${stat.accentColor}.9`} bg={`${stat.accentColor}.1`}>
                            {stat.percent}
                        </Pill>
                    ) : <div />}
                    {stat.trend && TrendIcon && (
                        <Group gap={3} align="center">
                            <TrendIcon
                                size={12}
                                color={stat.trendType === "up"
                                    ? "var(--mantine-color-green-7)"
                                    : "var(--mantine-color-red-7)"}
                            />
                            <Text size="xs" c={stat.trendType === "up" ? "green.7" : "red.7"}>
                                {stat.trend}
                            </Text>
                            <Text size="xs" c="dimmed">vs kỳ trước</Text>
                        </Group>
                    )}
                </Group>
            </Stack>
        </Paper>
    );
}

// ─── RetentionBarChart ────────────────────────────────────────────────────────
function RetentionBarChart({ title, data, dataKey }: {
    title: string;
    data: any[];
    dataKey: string;
}) {
    if (!data.length) return null;
    return (
        <Paper withBorder p="md" radius="md" shadow="xs">
            <Title order={4} mb="md">{title}</Title>
            <BarChart
                h={300}
                data={data}
                dataKey={dataKey}
                withLegend
                legendProps={{ verticalAlign: "bottom", wrapperStyle: { paddingTop: 12, fontSize: 13 } }}
                series={[
                    { name: "moi", label: "Mới", color: "green.6" },
                    { name: "giaHan", label: "Gia hạn", color: "blue.6" },
                    { name: "chuaTrienKhai", label: "Chưa triển khai", color: "yellow.6" },
                    { name: "huy", label: "Hủy", color: "red.6" },
                ]}
            />
        </Paper>
    );
}

// ─── SchoolDetailModal ────────────────────────────────────────────────────────
function SchoolDetailModal({ school, opened, onClose, periods }: {
    school: School | null;
    opened: boolean;
    onClose: () => void;
    periods: string[];
}) {
    if (!school) return null;

    const levelColor = SCHOOL_LEVEL_COLOR[school.schoolLevel] ?? "gray";

    const totalNew = periods.reduce((s, p) => s + (school.periods[p]?.newStudents ?? 0), 0);
    const totalRenewed = periods.reduce((s, p) => s + (school.periods[p]?.renewed ?? 0), 0);
    const totalCancelled = periods.reduce((s, p) => s + (school.periods[p]?.cancelled ?? 0), 0);
    const totalGraduated = periods.reduce((s, p) => s + (school.periods[p]?.graduated ?? 0), 0);

    const periodsWithStudents = periods.filter(p => (school.periods[p]?.students ?? 0) > 0);
    const firstStudents = periodsWithStudents.length > 0
        ? school.periods[periodsWithStudents[0]].students : 0;
    const lastStudents = periodsWithStudents.length > 0
        ? school.periods[periodsWithStudents[periodsWithStudents.length - 1]].students : 0;
    const overallPct = firstStudents > 0 ? Math.round((lastStudents / firstStudents) * 100) : 0;
    const overallColor = getRetentionColor(overallPct);

    const lineData = periods.map((period, idx) => {
        const data = school.periods[period];
        const prevData = idx > 0 ? school.periods[periods[idx - 1]] : undefined;
        const retentionPct =
            data && prevData && prevData.students > 0
                ? Math.round((data.students / prevData.students) * 100)
                : null;
        return {
            period,
            "Đăng ký mới": data?.newStudents ?? null,
            "Tái đăng ký": data?.renewed ?? null,
            "Tốt nghiệp": data?.graduated ?? null,
            "Hủy đăng ký": data?.cancelled ?? null,
            "Tỷ lệ tái đăng ký (%)": retentionPct,
        };
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
            radius="md"
            title={
                <Group gap="sm">
                    <ThemeIcon color={levelColor} variant="light" size="xl" radius="md">
                        <IconBuildings size={24} />
                    </ThemeIcon>
                    <Stack gap={2}>
                        <Text fw={700} size="md">{school.schoolName}</Text>
                        <Group gap={4}>
                            <Badge variant="light" color="gray" size="xs">{school.id}</Badge>
                            <Text size="xs" c="dimmed">• {school.ward} - {school.province}</Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                            <IconMapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                            {school.area} •{" "}
                            <IconBriefcase size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                            {school.businessName}
                        </Text>
                    </Stack>
                </Group>
            }
        >
            <Stack gap="md">
                {/* ── Tổng quan ── */}
                <Paper withBorder p="sm" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="sm">
                        Tổng quan học sinh
                    </Text>
                    <Grid>
                        <Grid.Col span={6}>
                            <Paper p="sm" radius="md" h="100%">
                                <Text size="xs" ta="center" c="dimmed" fw={600} mb="xs">
                                    Retention tổng thể
                                </Text>
                                <Center>
                                    <RingProgress
                                        size={130}
                                        thickness={13}
                                        roundCaps
                                        sections={[{ value: Math.min(overallPct, 100), color: overallColor }]}
                                        label={
                                            <Center>
                                                <Stack gap={0} align="center">
                                                    <Text fw={700} size="lg" c={`${overallColor}.6`}>
                                                        {overallPct}%
                                                    </Text>
                                                    <Text size="10px" c="dimmed">retention</Text>
                                                </Stack>
                                            </Center>
                                        }
                                    />
                                </Center>
                                <Text size="xs" c="dimmed" ta="center" mt={4}>
                                    {firstStudents.toLocaleString('vi-VN')} ⟶ {lastStudents.toLocaleString('vi-VN')} học sinh
                                </Text>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Paper p="sm" radius="md" h="100%">
                                <Text size="xs" ta="center" c="dimmed" fw={600} mb="xs">
                                    Phân bổ học sinh
                                </Text>
                                <Center>
                                    <DonutChart
                                        size={130}
                                        thickness={26}
                                        data={[
                                            { name: "Đăng ký mới", value: totalNew, color: "blue.6" },
                                            { name: "Gia hạn", value: totalRenewed, color: "teal.6" },
                                            { name: "Hủy đăng ký", value: totalCancelled, color: "red.5" },
                                            { name: "Tốt nghiệp", value: totalGraduated, color: "violet.5" },
                                        ]}
                                        tooltipDataSource="segment"
                                        withTooltip
                                        chartLabel={(totalNew + totalRenewed + totalCancelled + totalGraduated).toLocaleString('vi-VN')}
                                    />
                                </Center>
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* ── Bảng chi tiết theo giai đoạn ── */}
                <Paper withBorder p="sm" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="sm">
                        Chi tiết theo giai đoạn
                    </Text>
                    <Box style={{ overflowX: "auto" }}>
                        <Table striped withTableBorder highlightOnHover style={{ minWidth: 760 }}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Giai đoạn</Table.Th>
                                    <Table.Th ta="center">Học sinh</Table.Th>
                                    <Table.Th ta="center">Trạng thái</Table.Th>
                                    <Table.Th ta="center">Đăng ký mới</Table.Th>
                                    <Table.Th ta="center">Tái đăng ký</Table.Th>
                                    <Table.Th ta="center">Tốt nghiệp</Table.Th>
                                    <Table.Th ta="center">Hủy</Table.Th>
                                    <Table.Th ta="center">Retention</Table.Th>
                                    <Table.Th ta="center">Tăng/giảm</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {periods.map((period, idx) => {
                                    const data = school.periods[period];
                                    const prevData = idx > 0 ? school.periods[periods[idx - 1]] : undefined;
                                    const pctStr = data && prevData
                                        ? calcRetentionPercent(data.students, prevData.students)
                                        : null;
                                    const pctNum = pctStr ? parseInt(pctStr) : null;
                                    const delta = data && prevData
                                        ? data.students - prevData.students
                                        : null;

                                    if (!data) {
                                        return (
                                            <Table.Tr key={period}>
                                                <Table.Td><Text size="sm">{period}</Text></Table.Td>
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <Table.Td key={i} ta="center">
                                                        <Text size="xs" c="dimmed">—</Text>
                                                    </Table.Td>
                                                ))}
                                            </Table.Tr>
                                        );
                                    }

                                    return (
                                        <Table.Tr key={period}>
                                            <Table.Td><Text size="sm" fw={500}>{period}</Text></Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="sm" fw={700}>{data.students.toLocaleString('vi-VN')}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Badge size="xs" color={STATUS_COLORS[data.status]} variant="light">
                                                    {STATUS_LABELS[data.status]}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.newStudents?.toLocaleString('vi-VN') ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.renewed?.toLocaleString('vi-VN') ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.graduated?.toLocaleString('vi-VN') ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.cancelled?.toLocaleString('vi-VN') ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                {pctNum !== null ? (
                                                    <Badge size="sm" color={getRetentionColor(pctNum)} variant="filled">
                                                        {pctStr}
                                                    </Badge>
                                                ) : (
                                                    <Text size="xs" c="dimmed">—</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                {delta !== null ? (
                                                    <Group gap={3} justify="center">
                                                        {delta > 0
                                                            ? <IconTrendingUp size={14} color="var(--mantine-color-green-6)" />
                                                            : delta < 0
                                                                ? <IconTrendingDown size={14} color="var(--mantine-color-red-6)" />
                                                                : <IconMinus size={14} color="var(--mantine-color-gray-5)" />
                                                        }
                                                        <Text
                                                            size="xs" fw={600}
                                                            c={delta > 0 ? "green.6" : delta < 0 ? "red.6" : "dimmed"}
                                                        >
                                                            {delta > 0 ? "+" : ""}{delta.toLocaleString('vi-VN')}
                                                        </Text>
                                                    </Group>
                                                ) : (
                                                    <Text size="xs" c="dimmed">—</Text>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Box>
                </Paper>

                {/* ── Line Chart xu hướng ── */}
                <Paper withBorder p="sm" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="sm">
                        Xu hướng theo giai đoạn
                    </Text>
                    <LineChart
                        h={280}
                        data={lineData}
                        dataKey="period"
                        withLegend
                        withTooltip
                        withDots
                        connectNulls
                        legendProps={{ verticalAlign: "bottom", height: 44 }}
                        yAxisProps={{ tickFormatter: (v: number) => v.toLocaleString('vi-VN') }}
                        series={[
                            { name: "Đăng ký mới", color: "blue.5" },
                            { name: "Tái đăng ký", color: "teal.5" },
                            { name: "Tốt nghiệp", color: "violet.5" },
                            { name: "Hủy đăng ký", color: "red.5" },
                            { name: "Tỷ lệ tái đăng ký (%)", color: "orange.5" },
                        ]}
                        tooltipProps={{
                            content: ({ payload, label }: any) => {
                                if (!payload?.length) return null;
                                return (
                                    <Paper p="xs" withBorder shadow="sm" radius="sm" style={{ minWidth: 200 }}>
                                        <Text size="xs" fw={700} mb={6}>{label}</Text>
                                        <Stack gap={4}>
                                            {payload.map((entry: any) => (
                                                <Group key={entry.name} gap={6} justify="space-between">
                                                    <Group gap={4}>
                                                        <Box
                                                            w={8} h={8}
                                                            style={{ borderRadius: 2, background: entry.color, flexShrink: 0 }}
                                                        />
                                                        <Text size="xs" c="dimmed">{entry.name}</Text>
                                                    </Group>
                                                    <Text size="xs" fw={600}>
                                                        {entry.value === null || entry.value === undefined
                                                            ? "—"
                                                            : entry.name.includes("%")
                                                                ? `${entry.value}%`
                                                                : Number(entry.value).toLocaleString('vi-VN')
                                                        }
                                                    </Text>
                                                </Group>
                                            ))}
                                        </Stack>
                                    </Paper>
                                );
                            },
                        }}
                    />
                    <Text size="xs" c="dimmed" ta="center" mt={4}>
                        * Tỷ lệ tái đăng ký (%) = học sinh kỳ hiện tại / kỳ trước × 100
                    </Text>
                </Paper>
            </Stack>
        </Modal>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ReportClientProps {
    /** Danh sách trường đã được merge từ Schools + RetentionSchools */
    schools: School[];
    initialPeriods?: string[];
    initialAreas?: string[];
    initialBusinesses?: string[];
    initialSchoolLevels?: string[];
    // Legacy prop — không còn dùng nhưng giữ để không break nếu còn nơi nào truyền vào
    initialData?: any;
}

export default function ReportClient({
    schools: allSchools,
    initialPeriods,
    initialAreas,
    initialBusinesses,
    initialSchoolLevels,
}: ReportClientProps) {

    const periods = (initialPeriods && initialPeriods.length) ? initialPeriods : DEFAULT_PERIODS;

    const [activePeriod, setActivePeriod] = useState<string>(periods[0]);
    const [areaFilter, setAreaFilter] = useState<string>("Tất cả");
    const [businessFilter, setBusinessFilter] = useState<string>("Tất cả");
    const [schoolLevelFilter, setSchoolLevelFilter] = useState<string>("Tất cả");
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>("Trường");
    const [isScrolled, setIsScrolled] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<RetentionStatus | null>(null);
    const [vietnamTime, setVietnamTime] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState("10");
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const [modalOpened, setModalOpened] = useState(false);

    const isMobile = useMediaQuery("(max-width: 768px)");

    // Build select option lists
    const uniq = (arr: (string | undefined)[]) =>
        Array.from(new Set((arr || []).filter(Boolean).map(s => String(s).trim())));

    const areaList = uniq(initialAreas ?? []);
    const businessList = uniq(initialBusinesses ?? []);
    const schoolLevelList = uniq(initialSchoolLevels ?? []);

    const areaOptions = ["Tất cả", ...areaList.filter(v => v !== "Tất cả")];
    const businessOptions = ["Tất cả", ...businessList.filter(v => v !== "Tất cả")];
    const schoolLevelOptions = ["Tất cả", ...schoolLevelList.filter(v => v !== "Tất cả")];

    const displayPeriods = periods.filter(p => p !== "Tất cả");

    const firstPeriod = displayPeriods[0];
    const lastPeriod = displayPeriods[displayPeriods.length - 1];

    const startYear = firstPeriod?.split("-")[0];
    const endYear = lastPeriod?.split("-")[1];

    const periodLabel = `Giai đoạn ${startYear}-${endYear}`;

    // Apply dropdown filters
    const filteredByDropdown = useMemo(() =>
        allSchools.filter(s => {
            if (areaFilter !== "Tất cả" && s.area !== areaFilter) return false;
            if (businessFilter !== "Tất cả" && s.businessName !== businessFilter) return false;
            if (schoolLevelFilter !== "Tất cả" && s.schoolLevel !== schoolLevelFilter) return false;
            return true;
        }),
        [allSchools, areaFilter, businessFilter, schoolLevelFilter]
    );

    // Apply search + status filter (for the table)
    const filteredSchools = useMemo(() => {
        const kw = search.toLowerCase().trim();

        return filteredByDropdown.filter((school) => {
            const matchSearch =
                school.schoolName.toLowerCase().includes(kw) ||
                school.id.toLowerCase().includes(kw);

            // lọc theo kỳ
            const matchPeriod =
                activePeriod === "Tất cả"
                    ? true
                    : !!school.periods[activePeriod];

            // lọc theo trạng thái
            const matchStatus =
                !statusFilter
                    ? true
                    : activePeriod === "Tất cả"
                        ? Object.values(school.periods).some(
                            p => p.status === statusFilter
                        )
                        : school.periods[activePeriod]?.status === statusFilter;

            return (
                matchSearch &&
                matchPeriod &&
                matchStatus
            );
        });
    }, [
        filteredByDropdown,
        search,
        statusFilter,
        activePeriod,
    ]);

    const paginatedSchools = useMemo(() => {
        const start = (page - 1) * Number(pageSize);
        return filteredSchools.slice(start, start + Number(pageSize));
    }, [filteredSchools, page, pageSize]);

    // Compute dynamic stats based on currently active period
    const stats = useMemo(() =>
        computeStats(filteredByDropdown, activePeriod, periods),
        [filteredByDropdown, activePeriod, periods]
    );

    // Compute chart data
    const periodChartData = useMemo(() =>
        computePeriodChartData(filteredByDropdown, activePeriod, periods),
        [filteredByDropdown, activePeriod, periods]
    );

    const areaChartData = useMemo(() =>
        computeChartData(filteredByDropdown, activePeriod, periods, "area"),
        [filteredByDropdown, activePeriod, periods]
    );

    const businessChartData = useMemo(() =>
        computeChartData(filteredByDropdown, activePeriod, periods, "businessName"),
        [filteredByDropdown, activePeriod, periods]
    );

    const schoolLevelChartData = useMemo(() =>
        computeChartData(filteredByDropdown, activePeriod, periods, "schoolLevel"),
        [filteredByDropdown, activePeriod, periods]
    );

    // Quick filter counts
    const totalStudents = useMemo(() => {
        let total = 0;

        for (const school of filteredByDropdown) {
            if (activePeriod === "Tất cả") {
                // Tổng tất cả kỳ
                for (const pd of Object.values(school.periods)) {
                    total += pd?.students ?? 0;
                }
            } else {
                const pd = school.periods[activePeriod];
                total += pd?.students ?? 0;
            }
        }

        return total;
    }, [filteredByDropdown, activePeriod]);

    const openDetail = (school: School) => {
        setSelectedSchool(school);
        setModalOpened(true);
    };

    // Vietnam time ticker
    useEffect(() => {
        const update = () =>
            setVietnamTime(
                new Date().toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    year: "numeric", month: "2-digit", day: "2-digit",
                    hour: "2-digit", minute: "2-digit", second: "2-digit",
                    hour12: false,
                })
            );
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    // Sticky header shadow
    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 80);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Reset page khi filter thay đổi
    useEffect(() => { setPage(1); }, [search, statusFilter, areaFilter, businessFilter, schoolLevelFilter, activePeriod]);

    if (!allSchools || allSchools.length === 0) {
        return (
            <Box p="xl">
                <Alert icon={<IconAlertCircle size={16} />} title="Không có dữ liệu" color="yellow">
                    Không tìm thấy dữ liệu trường. Vui lòng kiểm tra Google Sheets.
                </Alert>
            </Box>
        );
    }

    return (
        <>
            <SchoolDetailModal
                school={selectedSchool}
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                periods={periods}
            />

            <Stack gap="lg" px="md" maw={1400} mx="auto">

                {/* ── Header ── */}
                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm">
                            {!isMobile && (
                                <Image
                                    src="/Logo_at-02.png"
                                    alt="Logo"
                                    h={48}
                                    w="auto"
                                    fit="contain"
                                    fallbackSrc="https://placehold.co/160x48?text=Logo"
                                />
                            )}
                            <Divider orientation="vertical" />
                            <Stack gap={2}>
                                <Title order={2} fw={700}>Tái đăng ký app Ôn luyện</Title>
                                <Text size="sm" c="blue.6" fw={500}>
                                    {periodLabel}
                                </Text>
                                <Group gap={6}>
                                    <IconClockCheck size={16} color="gray" />
                                    <Text size="xs" c="dimmed">Cập nhật lần cuối: {vietnamTime}</Text>
                                </Group>
                            </Stack>
                        </Group>
                        <RefreshButton />
                    </Group>
                </Paper>

                {/* ── Sticky Filters ── */}
                <Paper
                    withBorder p="md" radius="md"
                    shadow={isScrolled ? "sm" : "xs"}
                    style={{
                        position: "sticky", top: 0, zIndex: 100,
                        backgroundColor: isScrolled
                            ? "var(--mantine-color-gray-1)"
                            : "white",
                    }}
                >
                    <Group justify="space-between" wrap="wrap" gap="md">
                        <Group gap={8}>
                            <Group gap={6}>
                                <IconCalendar size={20} />
                                <Text fw={500} tt="uppercase" size="md">Giai đoạn</Text>
                            </Group>
                            <SegmentedControl
                                data={periods}
                                value={activePeriod}
                                onChange={setActivePeriod}
                                size="sm"
                                radius="md"
                            />
                        </Group>
                        <Group gap="sm" wrap="nowrap">
                            <Select
                                placeholder="Khu vực"
                                data={areaOptions}
                                value={areaFilter}
                                onChange={val => setAreaFilter(val || "Tất cả")}
                                leftSection={<IconMapPin size={16} />}
                            />
                            <Select
                                placeholder="Kinh doanh"
                                data={businessOptions}
                                value={businessFilter}
                                onChange={val => setBusinessFilter(val || "Tất cả")}
                                leftSection={<IconBriefcase size={16} />}
                            />
                            <Select
                                placeholder="Cấp học"
                                data={schoolLevelOptions}
                                value={schoolLevelFilter}
                                onChange={val => setSchoolLevelFilter(val || "Tất cả")}
                                leftSection={<IconBookmark size={16} />}
                            />
                        </Group>
                    </Group>
                    <Group gap="sm" mt="md">
                        {[
                            { label: "Trường", count: filteredByDropdown.length, color: "blue", icon: IconBuildings },
                            { label: "Học sinh", count: totalStudents, color: "green", icon: IconSchool },
                        ].map(({ label, count, color, icon: Icon }) => (
                            <Pill
                                key={label}
                                size="sm"
                                onClick={() => setActiveQuickFilter(activeQuickFilter === label ? null : label)}
                                style={{
                                    cursor: "pointer",
                                    border: `1.5px solid var(--mantine-color-${color}-${activeQuickFilter === label ? "9" : "3"})`,
                                    background: activeQuickFilter === label
                                        ? `var(--mantine-color-${color}-light)`
                                        : `var(--mantine-color-${color}-0)`,
                                    color: `var(--mantine-color-${color}-${activeQuickFilter === label ? "9" : "6"})`,
                                }}
                            >
                                <Group gap={6} wrap="nowrap">
                                    <Icon size={18} />
                                    <Text>
                                        {label} ({new Intl.NumberFormat('vi-VN').format(count)})
                                    </Text>
                                </Group>
                            </Pill>
                        ))}
                    </Group>
                </Paper>

                {/* ── Tổng quan ── */}
                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Text fw={700} size="md" tt="uppercase" c="dimmed" mb="md">
                        TỔNG QUAN — {activePeriod}
                    </Text>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                        {stats.map(stat => <StatCard key={stat.label} stat={stat} />)}
                    </SimpleGrid>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
                        <RetentionBarChart title="Retention theo giai đoạn" data={periodChartData} dataKey="period" />
                        <RetentionBarChart title="Retention theo khu vực" data={areaChartData} dataKey="area" />
                        <RetentionBarChart title="Retention theo kinh doanh" data={businessChartData} dataKey="business" />
                        <RetentionBarChart title="Retention theo cấp học" data={schoolLevelChartData} dataKey="schoolLevel" />
                    </SimpleGrid>
                </Paper>

                {/* ── Bảng chi tiết trường ── */}
                <Paper withBorder p="md" radius="md" shadow="xs" style={{ overflow: "hidden" }}>
                    <Group justify="space-between" mb="md">
                        <Text fw={700} size="md" tt="uppercase" c="dimmed">
                            Chi tiết trường ({filteredSchools.length})
                        </Text>
                        <Group gap={8}>
                            <TextInput
                                placeholder="Tìm trường hoặc ID..."
                                leftSection={<IconSearch size={14} />}
                                value={search}
                                onChange={e => setSearch(e.currentTarget.value)}
                                size="sm" w={220}
                            />
                            <Select
                                placeholder="Trạng thái"
                                data={[
                                    { value: "new", label: "Đăng ký mới" },
                                    { value: "renew", label: "Gia hạn" },
                                    { value: "not_started", label: "Chưa triển khai" },
                                    { value: "cancelled", label: "Hủy đăng ký" },
                                ]}
                                value={statusFilter}
                                onChange={val => setStatusFilter(val as RetentionStatus | null)}
                                clearable size="sm" w={160}
                            />
                        </Group>
                    </Group>

                    <Table
                        striped highlightOnHover withTableBorder stickyHeader
                        horizontalSpacing="sm" verticalSpacing="sm"
                        style={{ minWidth: 1200 }}
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>STT</Table.Th>
                                <Table.Th>Trường</Table.Th>
                                <Table.Th>Cấp học</Table.Th>
                                <Table.Th>Khu vực</Table.Th>
                                <Table.Th>Kinh doanh</Table.Th>
                                {periods.map(p => (
                                    <Table.Th key={p} ta="center">{p}</Table.Th>
                                ))}
                                <Table.Th />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedSchools.map((school, index) => {
                                const levelColor = SCHOOL_LEVEL_COLOR[school.schoolLevel] ?? "gray";
                                return (
                                    <Table.Tr key={school.id}>
                                        <Table.Td>{(page - 1) * Number(pageSize) + index + 1}</Table.Td>
                                        <Table.Td>
                                            <Stack gap={2}>
                                                <Text fw={600} size="sm">{school.schoolName}</Text>
                                                <Group gap={4}>
                                                    <Badge variant="light" color="gray" size="xs">{school.id}</Badge>
                                                    <Text size="xs" c="dimmed">• {school.ward} - {school.province}</Text>
                                                </Group>
                                            </Stack>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={levelColor} variant="light">{school.schoolLevel}</Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color="blue" variant="light">{school.area}</Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color="orange" variant="light">{school.businessName}</Badge>
                                        </Table.Td>
                                        {periods.map((period, pIdx) => {
                                            const ret = school.periods[period];
                                            const prev = pIdx > 0 ? school.periods[periods[pIdx - 1]] : undefined;
                                            if (!ret) {
                                                return (
                                                    <Table.Td key={period} ta="center">
                                                        <Text size="xs" c="dimmed">—</Text>
                                                    </Table.Td>
                                                );
                                            }
                                            const pctStr = prev
                                                ? calcRetentionPercent(ret.students, prev.students)
                                                : null;
                                            const pctNum = pctStr ? parseInt(pctStr) : null;
                                            return (
                                                <Table.Td key={period} ta="center">
                                                    <Stack gap={4} align="center">
                                                        <Text fw={700} size="sm">{ret.students.toLocaleString('vi-VN')}</Text>
                                                        {pctStr ? (
                                                            <Badge size="xs" color={getRetentionColor(pctNum!)} variant="filled">
                                                                {pctStr}
                                                            </Badge>
                                                        ) : (
                                                            <Badge size="xs" color={STATUS_COLORS[ret.status]} variant="light">
                                                                {STATUS_LABELS[ret.status]}
                                                            </Badge>
                                                        )}
                                                    </Stack>
                                                </Table.Td>
                                            );
                                        })}
                                        <Table.Td>
                                            <Tooltip label="Xem chi tiết" withArrow>
                                                <Button
                                                    variant="light" color="gray" size="xs"
                                                    onClick={() => openDetail(school)}
                                                >
                                                    <IconEye size={16} />
                                                </Button>
                                            </Tooltip>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>

                    {/* Pagination */}
                    <Box
                        px="sm" py="xs"
                        style={{
                            borderTop: "1px solid var(--mantine-color-default-border)",
                            background: "var(--mantine-color-gray-0)",
                        }}
                    >
                        <Group justify="space-between" wrap="wrap" gap={8}>
                            <Text size="xs" c="dimmed">
                                Hiển thị{" "}
                                <b>{(page - 1) * Number(pageSize) + 1}–{Math.min(page * Number(pageSize), filteredSchools.length)}</b>
                                {" "}trong tổng <b>{filteredSchools.length}</b> trường
                            </Text>
                            <Pagination
                                total={Math.ceil(filteredSchools.length / Number(pageSize))}
                                value={page}
                                onChange={setPage}
                                size="sm" radius="md"
                            />
                            <Group gap={6}>
                                <Select
                                    data={["10", "20", "30", "50", "100"]}
                                    value={pageSize}
                                    onChange={val => { setPageSize(val || "10"); setPage(1); }}
                                    w={70} size="xs"
                                />
                                <Text size="xs" c="dimmed">/ trang</Text>
                            </Group>
                        </Group>
                    </Box>
                </Paper>

            </Stack>
        </>
    );
}
