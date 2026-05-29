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

export interface Period {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
}

export interface SchoolPeriodData {
    students: number;
    status: RetentionStatus;
    // Chi tiết biến động học sinh trong kỳ
    newStudents?: number;   // Đăng ký mới
    renewed?: number;       // Tái đăng ký / gia hạn
    graduated?: number;     // Tốt nghiệp
    cancelled?: number;     // Hủy đăng ký
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
export const PERIODS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];

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

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const SCHOOLS: School[] = [
    {
        id: "S-00001",
        schoolName: "THPT Chuyên Hà Nội",
        area: "KV1",
        province: "Hà Nội",
        ward: "Thanh Xuân",
        schoolLevel: "THPT",
        businessName: "KD1",
        periods: {
            "2023-2024": { students: 1200, status: "renew",  newStudents: 200, renewed: 950, graduated: 30, cancelled: 20 },
            "2024-2025": { students: 1350, status: "renew",  newStudents: 220, renewed: 1080, graduated: 35, cancelled: 15 },
            "2025-2026": { students: 1500, status: "renew",  newStudents: 250, renewed: 1200, graduated: 40, cancelled: 10 },
            "2026-2027": { students: 1600, status: "renew",  newStudents: 180, renewed: 1380, graduated: 25, cancelled: 5  },
        },
    },
    {
        id: "S-00002",
        schoolName: "THCS Đống Đa",
        area: "KV1",
        province: "Hà Nội",
        ward: "Đống Đa",
        schoolLevel: "THCS",
        businessName: "KD1",
        periods: {
            "2023-2024": { students: 700,  status: "new",   newStudents: 700, renewed: 0,   graduated: 0,  cancelled: 0  },
            "2024-2025": { students: 850,  status: "renew", newStudents: 180, renewed: 650, graduated: 20, cancelled: 30 },
            "2025-2026": { students: 920,  status: "renew", newStudents: 120, renewed: 810, graduated: 25, cancelled: 15 },
            "2026-2027": { students: 950,  status: "renew", newStudents: 90,  renewed: 870, graduated: 30, cancelled: 10 },
        },
    },
    {
        id: "S-00003",
        schoolName: "Tiểu học Việt Úc",
        area: "KV2",
        province: "Đà Nẵng",
        ward: "Hải Châu",
        schoolLevel: "Tiểu học",
        businessName: "KD2",
        periods: {
            "2023-2024": { students: 0,   status: "not_started", newStudents: 0,   renewed: 0,   graduated: 0,  cancelled: 0 },
            "2024-2025": { students: 650, status: "new",         newStudents: 650, renewed: 0,   graduated: 0,  cancelled: 0 },
            "2025-2026": { students: 0,   status: "not_started", newStudents: 0,   renewed: 0,   graduated: 0,  cancelled: 0 },
            "2026-2027": { students: 720, status: "renew",       newStudents: 100, renewed: 580, graduated: 40, cancelled: 10 },
        },
    },
    {
        id: "S-00004",
        schoolName: "Liên cấp Nguyễn Huệ",
        area: "KV3",
        province: "TP.HCM",
        ward: "Bình Thạnh",
        schoolLevel: "Liên cấp",
        businessName: "KD3",
        periods: {
            "2023-2024": { students: 2000, status: "renew",     newStudents: 300, renewed: 1600, graduated: 60, cancelled: 40 },
            "2024-2025": { students: 2200, status: "renew",     newStudents: 350, renewed: 1780, graduated: 80, cancelled: 90 },
            "2025-2026": { students: 1800, status: "graduated", newStudents: 100, renewed: 1400, graduated: 400, cancelled: 100 },
            "2026-2027": { students: 0,    status: "cancelled", newStudents: 0,   renewed: 0,   graduated: 0,  cancelled: 1800 },
        },
    },
    {
        id: "S-00005",
        schoolName: "THPT Lê Quý Đôn",
        area: "KV4",
        province: "Cần Thơ",
        ward: "Ninh Kiều",
        schoolLevel: "THPT",
        businessName: "KD4",
        periods: {
            "2023-2024": { students: 0,    status: "cancelled", newStudents: 0,   renewed: 0,   graduated: 0,  cancelled: 0   },
            "2024-2025": { students: 900,  status: "new",       newStudents: 900, renewed: 0,   graduated: 0,  cancelled: 0   },
            "2025-2026": { students: 1050, status: "renew",     newStudents: 200, renewed: 820, graduated: 30, cancelled: 50  },
            "2026-2027": { students: 1120, status: "renew",     newStudents: 150, renewed: 950, graduated: 40, cancelled: 40  },
        },
    },
    {
        id: "S-00006",
        schoolName: "THCS Trần Phú",
        area: "KV2",
        province: "Huế",
        ward: "Phú Xuân",
        schoolLevel: "THCS",
        businessName: "KD2",
        periods: {
            "2023-2024": { students: 500, status: "new",   newStudents: 500, renewed: 0,   graduated: 0,  cancelled: 0  },
            "2024-2025": { students: 650, status: "renew", newStudents: 100, renewed: 520, graduated: 20, cancelled: 30 },
            "2025-2026": { students: 780, status: "renew", newStudents: 120, renewed: 630, graduated: 25, cancelled: 15 },
            "2026-2027": { students: 820, status: "renew", newStudents: 80,  renewed: 750, graduated: 30, cancelled: 10 },
        },
    },
];

export const retentionByPeriod = [
    { period: "2023-2024", giaHan: 88, totNghiep: 62, chuaTrienKhai: 38, huy: 22, tong: 123, moi: 10 },
    { period: "2024-2025", giaHan: 91, totNghiep: 68, chuaTrienKhai: 32, huy: 18, tong: 123, moi: 10 },
    { period: "2025-2026", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
];

const retentionByArea = [
    { area: "KV1", giaHan: 88, totNghiep: 62, chuaTrienKhai: 38, huy: 22, tong: 123, moi: 10 },
    { area: "KV2", giaHan: 91, totNghiep: 68, chuaTrienKhai: 32, huy: 18, tong: 123, moi: 10 },
    { area: "KV3", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
    { area: "KV4", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
];

const retentionByBusiness = [
    { business: "KD1", giaHan: 88, totNghiep: 62, chuaTrienKhai: 38, huy: 22, tong: 123, moi: 10 },
    { business: "KD2", giaHan: 91, totNghiep: 68, chuaTrienKhai: 32, huy: 18, tong: 123, moi: 10 },
    { business: "KD3", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
    { business: "KD4", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
];

const retentionBySchoolLevel = [
    { schoolLevel: "Tiểu học", giaHan: 88, totNghiep: 62, chuaTrienKhai: 38, huy: 22, tong: 123, moi: 10 },
    { schoolLevel: "THCS",     giaHan: 91, totNghiep: 68, chuaTrienKhai: 32, huy: 18, tong: 123, moi: 10 },
    { schoolLevel: "THPT",     giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
    { schoolLevel: "Liên cấp", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
];

const STATS: StatItem[] = [
    { label: "Tổng trường",       value: 234, icon: IconBuildings,        percent: null,   trend: "+3",  trendType: "up",      accentColor: "blue"   },
    { label: "Đăng ký mới",       value: 12,  icon: IconBuildingPlus,     percent: "5%",   trend: "+2%", trendType: "up",      accentColor: "green"  },
    { label: "Gia hạn",           value: 14,  icon: IconBuildingCommunity,percent: "6.0%", trend: "-1%", trendType: "down",    accentColor: "violet" },
    { label: "Chưa triển khai",   value: 9,   icon: IconHomeHand,         percent: "3.8%", trend: null,  trendType: "neutral", accentColor: "yellow" },
    { label: "Hủy đăng ký",       value: 4,   icon: IconBuildingMinus,    percent: "1.7%", trend: null,  trendType: "neutral", accentColor: "red"    },
];

const QUICK_FILTERS = [
    { label: "Trường",   count: 234, color: "blue",  icon: IconBuildings },
    { label: "Học sinh", count: 120, color: "green", icon: IconSchool    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcRetentionPercent(current: number, previous: number | undefined): string | null {
    if (previous === undefined || previous === 0) return null;
    return `${Math.round((current / previous) * 100)}%`;
}

function getRetentionColor(pct: number): string {
    if (pct >= 100) return "green";
    if (pct >= 80)  return "blue";
    if (pct >= 60)  return "yellow";
    return "red";
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ stat }: { stat: StatItem }) {
    const Icon = stat.icon;
    const TrendIcon =
        stat.trendType === "up" ? IconArrowUp :
        stat.trendType === "down" ? IconArrowDown : null;

    return (
        <Paper
            withBorder
            p="sm"
            radius="md"
            style={{ borderTop: `3px solid var(--mantine-color-${stat.accentColor}-5)` }}
        >
            <Stack gap={4}>
                <Group gap={6} align="center">
                    <Icon size={16} color={`var(--mantine-color-${stat.accentColor}-6)`} />
                    <Text size="sm" fw={500} c={`${stat.accentColor}.6`}>{stat.label}</Text>
                </Group>
                <Text size="xl" fw={700} c={`${stat.accentColor}.7`}>{stat.value.toLocaleString()}</Text>
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
                    { name: "moi",            label: "Mới",              color: "green.6"  },
                    { name: "giaHan",         label: "Gia hạn",          color: "blue.6"   },
                    { name: "totNghiep",      label: "Tốt nghiệp",       color: "violet.6" },
                    { name: "chuaTrienKhai",  label: "Chưa triển khai",  color: "yellow.6" },
                    { name: "huy",            label: "Hủy",              color: "red.6"    },
                ]}
            />
        </Paper>
    );
}

// ─── SchoolDetailModal ────────────────────────────────────────────────────────
function SchoolDetailModal({ school, opened, onClose }: {
    school: School | null;
    opened: boolean;
    onClose: () => void;
}) {
    if (!school) return null;

    const levelColor = SCHOOL_LEVEL_COLOR[school.schoolLevel] ?? "gray";

    // Tổng hợp toàn bộ giai đoạn
    const totalNew       = PERIODS.reduce((s, p) => s + (school.periods[p]?.newStudents ?? 0), 0);
    const totalRenewed   = PERIODS.reduce((s, p) => s + (school.periods[p]?.renewed    ?? 0), 0);
    const totalCancelled = PERIODS.reduce((s, p) => s + (school.periods[p]?.cancelled  ?? 0), 0);
    const totalGraduated = PERIODS.reduce((s, p) => s + (school.periods[p]?.graduated  ?? 0), 0);

    // Overall retention (kỳ đầu → kỳ cuối có học sinh)
    const periodsWithStudents = PERIODS.filter(p => (school.periods[p]?.students ?? 0) > 0);
    const firstStudents = periodsWithStudents.length > 0
        ? school.periods[periodsWithStudents[0]].students : 0;
    const lastStudents = periodsWithStudents.length > 0
        ? school.periods[periodsWithStudents[periodsWithStudents.length - 1]].students : 0;
    const overallPct   = firstStudents > 0 ? Math.round((lastStudents / firstStudents) * 100) : 0;
    const overallColor = getRetentionColor(overallPct);

    // Build line chart data
    const lineData = PERIODS.map((period, idx) => {
        const data     = school.periods[period];
        const prevData = idx > 0 ? school.periods[PERIODS[idx - 1]] : undefined;
        const retentionPct =
            data && prevData && prevData.students > 0
                ? Math.round((data.students / prevData.students) * 100)
                : null;
        return {
            period,
            "Đăng ký mới":           data?.newStudents  ?? null,
            "Tái đăng ký":           data?.renewed      ?? null,
            "Tốt nghiệp":            data?.graduated    ?? null,
            "Hủy đăng ký":           data?.cancelled    ?? null,
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
                        Tổng quan học sinh 2023–2027
                    </Text>
                    <Grid>
                        {/* Ring retention */}
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
                                    {firstStudents.toLocaleString()} ⟶ {lastStudents.toLocaleString()} học sinh
                                </Text>
                            </Paper>
                        </Grid.Col>

                        {/* Donut phân bổ */}
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
                                            { name: "Đăng ký mới", value: totalNew,       color: "blue.6"   },
                                            { name: "Gia hạn",     value: totalRenewed,   color: "teal.6"   },
                                            { name: "Hủy đăng ký", value: totalCancelled, color: "red.5"    },
                                            { name: "Tốt nghiệp",  value: totalGraduated, color: "violet.5" },
                                        ]}
                                        tooltipDataSource="segment"
                                        withTooltip
                                        chartLabel={(totalNew + totalRenewed + totalCancelled + totalGraduated).toLocaleString()}
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
                                {PERIODS.map((period, idx) => {
                                    const data     = school.periods[period];
                                    const prevData = idx > 0 ? school.periods[PERIODS[idx - 1]] : undefined;
                                    const pctStr   = data && prevData
                                        ? calcRetentionPercent(data.students, prevData.students)
                                        : null;
                                    const pctNum = pctStr ? parseInt(pctStr) : null;
                                    const delta  = data && prevData
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
                                            <Table.Td>
                                                <Text size="sm" fw={500}>{period}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="sm" fw={700}>{data.students.toLocaleString()}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Badge size="xs" color={STATUS_COLORS[data.status]} variant="light">
                                                    {STATUS_LABELS[data.status]}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.newStudents?.toLocaleString() ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.renewed?.toLocaleString() ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.graduated?.toLocaleString() ?? "—"}</Text>
                                            </Table.Td>
                                            <Table.Td ta="center">
                                                <Text size="xs">{data.cancelled?.toLocaleString() ?? "—"}</Text>
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
                                                            ? <IconTrendingUp  size={14} color="var(--mantine-color-green-6)" />
                                                            : delta < 0
                                                            ? <IconTrendingDown size={14} color="var(--mantine-color-red-6)" />
                                                            : <IconMinus       size={14} color="var(--mantine-color-gray-5)" />
                                                        }
                                                        <Text
                                                            size="xs"
                                                            fw={600}
                                                            c={delta > 0 ? "green.6" : delta < 0 ? "red.6" : "dimmed"}
                                                        >
                                                            {delta > 0 ? "+" : ""}{delta.toLocaleString()}
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
                        yAxisProps={{ tickFormatter: (v: number) => v.toLocaleString() }}
                        series={[
                            { name: "Đăng ký mới",           color: "blue.5"   },
                            { name: "Tái đăng ký",           color: "teal.5"   },
                            { name: "Tốt nghiệp",            color: "violet.5" },
                            { name: "Hủy đăng ký",           color: "red.5"    },
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
                                                            : Number(entry.value).toLocaleString()
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
export default function ReportClient({ initialData }: { initialData?: any }) {
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>("Trường");
    const [isScrolled, setIsScrolled]               = useState(false);
    const [search, setSearch]                       = useState("");
    const [statusFilter, setStatusFilter]           = useState<RetentionStatus | null>(null);
    const [vietnamTime, setVietnamTime]             = useState("");
    const [page, setPage]                           = useState(1);
    const [pageSize, setPageSize]                   = useState("10");
    const [selectedSchool, setSelectedSchool]       = useState<School | null>(null);
    const [modalOpened, setModalOpened]             = useState(false);

    const isMobile = useMediaQuery("(max-width: 768px)");

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

    // Filter
    const filteredSchools = useMemo(() => {
        const kw = search.toLowerCase().trim();
        return SCHOOLS.filter(s => {
            const matchSearch =
                s.schoolName.toLowerCase().includes(kw) ||
                s.id.toLowerCase().includes(kw);
            const matchStatus =
                !statusFilter ||
                Object.values(s.periods).some(p => p.status === statusFilter);
            return matchSearch && matchStatus;
        });
    }, [search, statusFilter]);

    const paginatedSchools = useMemo(() => {
        const start = (page - 1) * Number(pageSize);
        return filteredSchools.slice(start, start + Number(pageSize));
    }, [filteredSchools, page, pageSize]);

    return (
        <>
            <SchoolDetailModal
                school={selectedSchool}
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
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
                                <Text size="sm" c="blue.6" fw={500}>Giai đoạn 2023 – 2027</Text>
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
                            <SegmentedControl data={PERIODS} defaultValue={PERIODS[0]} size="sm" radius="md" />
                        </Group>
                        <Group gap="sm" wrap="nowrap">
                            <Select placeholder="Khu vực"   data={["Tất cả","KV1","KV2","KV3","KV4"]}                    defaultValue="Tất cả" leftSection={<IconMapPin   size={16} />} />
                            <Select placeholder="Kinh doanh" data={["Tất cả","KD1","KD2","KD3","KD4"]}                   defaultValue="Tất cả" leftSection={<IconBriefcase size={16} />} />
                            <Select placeholder="Cấp học"   data={["Tất cả","Tiểu học","THCS","THPT","Liên cấp"]}        defaultValue="Tất cả" leftSection={<IconBookmark  size={16} />} />
                        </Group>
                    </Group>
                    <Group gap="sm" mt="md">
                        {QUICK_FILTERS.map(({ label, count, color, icon: Icon }) => (
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
                                    <Text>{label} ({count})</Text>
                                </Group>
                            </Pill>
                        ))}
                    </Group>
                </Paper>

                {/* ── Tổng quan ── */}
                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Text fw={700} size="md" tt="uppercase" c="dimmed" mb="md">TỔNG QUAN</Text>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                        {STATS.map(stat => <StatCard key={stat.label} stat={stat} />)}
                    </SimpleGrid>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
                        <RetentionBarChart title="Retention theo giai đoạn" data={retentionByPeriod}      dataKey="period"      />
                        <RetentionBarChart title="Retention theo khu vực"   data={retentionByArea}        dataKey="area"        />
                        <RetentionBarChart title="Retention theo kinh doanh" data={retentionByBusiness}   dataKey="business"    />
                        <RetentionBarChart title="Retention theo cấp học"   data={retentionBySchoolLevel} dataKey="schoolLevel" />
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
                                    { value: "new",         label: "Đăng ký mới"     },
                                    { value: "renew",       label: "Gia hạn"         },
                                    { value: "not_started", label: "Chưa triển khai" },
                                    { value: "graduated",   label: "Tốt nghiệp"      },
                                    { value: "cancelled",   label: "Hủy"             },
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
                                {PERIODS.map(p => (
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
                                        {PERIODS.map((period, pIdx) => {
                                            const ret      = school.periods[period];
                                            const prev     = pIdx > 0 ? school.periods[PERIODS[pIdx - 1]] : undefined;
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
                                                        <Text fw={700} size="sm">{ret.students.toLocaleString()}</Text>
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
                                                <Button variant="light" color="gray" size="xs" onClick={() => openDetail(school)}>
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
                                    data={["10","20","30","50","100"]}
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