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
    ThemeIcon,
    TextInput,
    Divider,
    Pagination,
    Box,
} from "@mantine/core";
import { BarChart } from '@mantine/charts';
import '@mantine/charts/styles.css';
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
    IconHomeHand,
    IconMapPin,
    IconSchool,
    IconSearch,
} from "@tabler/icons-react";
import { useMediaQuery } from '@mantine/hooks';

import RefreshButton from "./RefreshButton";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RetentionStatus = "new" | "renew" | "graduated" | "not_started" | "cancelled";

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
}

export interface School {
    id: string;
    schoolName: string;
    area: string;
    province: string;
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

// ─── Mock Data ─────────────────────────────────────────────────────────────
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

export const SCHOOLS: School[] = [
    {
        id: "S-00001",
        schoolName: "THPT Chuyên Hà Nội",
        area: "KV1",
        province: "Hà Nội",
        schoolLevel: "THPT",
        businessName: "KD1",
        periods: {
            "2023-2024": { students: 1200, status: "renew" },
            "2024-2025": { students: 1350, status: "renew" },
            "2025-2026": { students: 1500, status: "renew" },
            "2026-2027": { students: 1600, status: "renew" },
        },
    },
    {
        id: "S-00002",
        schoolName: "THCS Đống Đa",
        area: "KV1",
        province: "Hà Nội",
        schoolLevel: "THCS",
        businessName: "KD1",
        periods: {
            "2023-2024": { students: 700, status: "new" },
            "2024-2025": { students: 850, status: "renew" },
            "2025-2026": { students: 920, status: "renew" },
            "2026-2027": { students: 950, status: "renew" },
        },
    },
    {
        id: "S-00003",
        schoolName: "Tiểu học Việt Úc",
        area: "KV2",
        province: "Đà Nẵng",
        schoolLevel: "Tiểu học",
        businessName: "KD2",
        periods: {
            "2023-2024": { students: 0, status: "not_started" },
            "2024-2025": { students: 650, status: "new" },
            "2025-2026": { students: 0, status: "not_started" },
            "2026-2027": { students: 720, status: "renew" },
        },
    },
    {
        id: "S-00004",
        schoolName: "Liên cấp Nguyễn Huệ",
        area: "KV3",
        province: "TP.HCM",
        schoolLevel: "Liên cấp",
        businessName: "KD3",
        periods: {
            "2023-2024": { students: 2000, status: "renew" },
            "2024-2025": { students: 2200, status: "renew" },
            "2025-2026": { students: 1800, status: "graduated" },
            "2026-2027": { students: 0, status: "cancelled" },
        },
    },
    {
        id: "S-00005",
        schoolName: "THPT Lê Quý Đôn",
        area: "KV4",
        province: "Cần Thơ",
        schoolLevel: "THPT",
        businessName: "KD4",
        periods: {
            "2023-2024": { students: 0, status: "cancelled" },
            "2024-2025": { students: 900, status: "new" },
            "2025-2026": { students: 1050, status: "renew" },
            "2026-2027": { students: 1120, status: "renew" },
        },
    },
    {
        id: "S-00006",
        schoolName: "THCS Trần Phú",
        area: "KV2",
        province: "Huế",
        schoolLevel: "THCS",
        businessName: "KD2",
        periods: {
            "2023-2024": { students: 500, status: "new" },
            "2024-2025": { students: 650, status: "renew" },
            "2025-2026": { students: 780, status: "renew" },
            "2026-2027": { students: 820, status: "renew" },
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
    { schoolLevel: "THCS", giaHan: 91, totNghiep: 68, chuaTrienKhai: 32, huy: 18, tong: 123, moi: 10 },
    { schoolLevel: "THPT", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
    { schoolLevel: "Liên cấp", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 123, moi: 10 },
];

const STATS: StatItem[] = [
    {
        label: "Tổng trường",
        value: 234,
        icon: IconBuildings,
        percent: null,
        trend: "+3",
        trendType: "up",
        accentColor: "blue",
    },
    {
        label: "Đăng ký mới",
        value: 12,
        icon: IconBuildingPlus,
        percent: "5%",
        trend: "+2%",
        trendType: "up",
        accentColor: "green",
    },
    {
        label: "Gia hạn",
        value: 14,
        icon: IconBuildingCommunity,
        percent: "6.0%",
        trend: "-1%",
        trendType: "down",
        accentColor: "violet",
    },
    {
        label: "Chưa triển khai",
        value: 9,
        icon: IconHomeHand,
        percent: "3.8%",
        trend: null,
        trendType: "neutral",
        accentColor: "yellow",
    },
    {
        label: "Hủy đăng ký",
        value: 4,
        icon: IconBuildingMinus,
        percent: "1.7%",
        trend: null,
        trendType: "neutral",
        accentColor: "red",
    },
];

const QUICK_FILTERS = [
    { label: "Trường", count: 234, color: "blue", icon: IconBuildings },
    { label: "Học sinh", count: 120, color: "green", icon: IconSchool },
];

// ─── Sub Components ────────────────────────────────────────────────────────
function StatCard({ stat }: { stat: StatItem }) {
    const Icon = stat.icon;
    const TrendIcon = stat.trendType === "up" ? IconArrowUp : stat.trendType === "down" ? IconArrowDown : null;

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
                    <Text size="sm" fw={500} c={`${stat.accentColor}.6`}>
                        {stat.label}
                    </Text>
                </Group>

                <Text size="xl" fw={700} c={`${stat.accentColor}.7`}>
                    {stat.value.toLocaleString()}
                </Text>

                <Group justify="space-between" align="center">
                    {stat.percent ? (
                        <Pill size="xs" c={`${stat.accentColor}.9`} bg={`${stat.accentColor}.1`}>
                            {stat.percent}
                        </Pill>
                    ) : (
                        <div />
                    )}

                    {stat.trend && TrendIcon && (
                        <Group gap={3} align="center">
                            <TrendIcon
                                size={12}
                                color={stat.trendType === "up" ? "var(--mantine-color-green-7)" : "var(--mantine-color-red-7)"}
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
                legendProps={{
                    verticalAlign: 'bottom',
                    wrapperStyle: { paddingTop: 12, fontSize: 13 },
                }}
                series={[
                    { name: "moi", label: "Mới", color: "green.6" },
                    { name: "giaHan", label: "Gia hạn", color: "blue.6" },
                    { name: "totNghiep", label: "Tốt nghiệp", color: "violet.6" },
                    { name: "chuaTrienKhai", label: "Chưa triển khai", color: "yellow.6" },
                    { name: "huy", label: "Hủy", color: "red.6" },
                ]}
            />
        </Paper>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ReportClient({ initialData }: { initialData?: any }) {
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>("Trường");
    const [isScrolled, setIsScrolled] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<RetentionStatus | null>(null);
    const [vietnamTime, setVietnamTime] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState("10");

    const isMobile = useMediaQuery('(max-width: 768px)');

    // Real-time Vietnam time
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setVietnamTime(
                now.toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Scroll effect for sticky header
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Filter logic
    const filteredSchools = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return SCHOOLS.filter((school) => {
            const matchSearch =
                school.schoolName.toLowerCase().includes(keyword) ||
                school.id.toLowerCase().includes(keyword);

            const matchStatus =
                !statusFilter ||
                Object.values(school.periods).some((p) => p.status === statusFilter);

            return matchSearch && matchStatus;
        });
    }, [search, statusFilter]);

    const paginatedSchools = useMemo(() => {
        const start = (page - 1) * Number(pageSize);
        const end = start + Number(pageSize);
        return filteredSchools.slice(start, end);
    }, [filteredSchools, page, pageSize]);

    return (
        <Stack gap="lg" px="md" maw={1400} mx="auto">
            {/* Header */}
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
                            <Title order={2} fw={700}>
                                Tái đăng ký app Ôn luyện
                            </Title>
                            <Text size="sm" c="blue.6" fw={500}>
                                Giai đoạn 2023 – 2026
                            </Text>
                            <Group gap={6}>
                                <IconClockCheck size={16} color="gray" />
                                <Text size="xs" c="dimmed">
                                    Cập nhật lần cuối: {vietnamTime}
                                </Text>
                            </Group>
                        </Stack>
                    </Group>
                    <RefreshButton />
                </Group>
            </Paper>

            {/* Sticky Filters */}
            <Paper
                withBorder
                p="md"
                radius="md"
                shadow={isScrolled ? "sm" : "xs"}
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backgroundColor: isScrolled ? "var(--mantine-color-gray-1)" : "white",
                }}
            >
                {/* Period + Filters */}
                <Group justify="space-between" wrap="wrap" gap="md">
                    <Group gap={8}>
                        <Group gap={6}>
                            <IconCalendar size={20} />
                            <Text fw={500} tt="uppercase" size="md">
                                Giai đoạn
                            </Text>
                        </Group>
                        <SegmentedControl data={PERIODS} defaultValue={PERIODS[0]} size="sm" radius="md" />
                    </Group>

                    <Group gap="sm" wrap="nowrap">
                        <Select placeholder="Khu vực" data={["Tất cả", "KV1", "KV2", "KV3", "KV4"]} defaultValue="Tất cả" leftSection={<IconMapPin size={16} />} />
                        <Select placeholder="Kinh doanh" data={["Tất cả", "KD1", "KD2", "KD3", "KD4"]} defaultValue="Tất cả" leftSection={<IconBriefcase size={16} />} />
                        <Select placeholder="Cấp học" data={["Tất cả", "Tiểu học", "THCS", "THPT", "Liên cấp"]} defaultValue="Tất cả" leftSection={<IconBookmark size={16} />} />
                    </Group>
                </Group>

                {/* Quick Filters */}
                <Group gap="sm" mt="md">
                    {QUICK_FILTERS.map(({ label, count, color, icon: Icon }) => (
                        <Pill
                            key={label}
                            size="sm"
                            onClick={() => setActiveQuickFilter(activeQuickFilter === label ? null : label)}
                            style={{
                                cursor: "pointer",
                                border: `1.5px solid var(--mantine-color-${color}-${activeQuickFilter === label ? '9' : '3'})`,
                                background: activeQuickFilter === label
                                    ? `var(--mantine-color-${color}-light)`
                                    : `var(--mantine-color-${color}-0)`,
                                color: `var(--mantine-color-${color}-${activeQuickFilter === label ? '9' : '6'})`,
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

            {/* Overview Section */}
            <Paper withBorder p="md" radius="md" shadow="xs">
                <Text fw={700} size="md" tt="uppercase" c="dimmed" mb="md">
                    TỔNG QUAN
                </Text>

                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                    {STATS.map((stat) => (
                        <StatCard key={stat.label} stat={stat} />
                    ))}
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
                    <RetentionBarChart title="Retention theo giai đoạn" data={retentionByPeriod} dataKey="period" />
                    <RetentionBarChart title="Retention theo khu vực" data={retentionByArea} dataKey="area" />
                    <RetentionBarChart title="Retention theo kinh doanh" data={retentionByBusiness} dataKey="business" />
                    <RetentionBarChart title="Retention theo cấp học" data={retentionBySchoolLevel} dataKey="schoolLevel" />
                </SimpleGrid>
            </Paper>

            {/* School Detail Table */}
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
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            size="sm"
                            w={220}
                        />
                        <Select
                            placeholder="Trạng thái"
                            data={[
                                { value: "new", label: "Đăng ký mới" },
                                { value: "renew", label: "Gia hạn" },
                                { value: "not_started", label: "Chưa triển khai" },
                                { value: "graduated", label: "Tốt nghiệp" },
                                { value: "cancelled", label: "Hủy" },
                            ]}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val as RetentionStatus | null)}
                            clearable
                            size="sm"
                            w={160}
                        />
                    </Group>
                </Group>

                <Table
                    striped
                    highlightOnHover
                    withTableBorder
                    stickyHeader
                    horizontalSpacing="sm"
                    verticalSpacing="sm"
                    style={{ minWidth: 1200 }}
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>STT</Table.Th>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Tên trường</Table.Th>
                            <Table.Th>Khu vực</Table.Th>
                            <Table.Th>Tỉnh</Table.Th>
                            <Table.Th>Cấp học</Table.Th>
                            <Table.Th>Kinh doanh</Table.Th>
                            {PERIODS.map((period) => (
                                <Table.Th key={period} ta="center">
                                    {period}
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {filteredSchools.map((school, index) => (
                            <Table.Tr key={school.id}>
                                <Table.Td>{index + 1}</Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="gray">{school.id}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Stack gap={2}>
                                        <Text fw={600} size="sm">{school.schoolName}</Text>
                                        <Text size="xs" c="dimmed">{school.province}</Text>
                                    </Stack>
                                </Table.Td>
                                <Table.Td><Badge color="blue" variant="light">{school.area}</Badge></Table.Td>
                                <Table.Td>{school.province}</Table.Td>
                                <Table.Td><Badge color="violet" variant="light">{school.schoolLevel}</Badge></Table.Td>
                                <Table.Td><Badge color="orange" variant="light">{school.businessName}</Badge></Table.Td>

                                {PERIODS.map((period) => {
                                    const retention = school.periods[period];

                                    if (!retention) {
                                        return (
                                            <Table.Td key={period} ta="center">
                                                <Text size="xs" c="dimmed">-</Text>
                                            </Table.Td>
                                        );
                                    }

                                    return (
                                        <Table.Td key={period} ta="center">
                                            <Stack gap={4} align="center">
                                                <Text fw={700} size="sm">
                                                    {retention.students.toLocaleString()}
                                                </Text>
                                                <Badge
                                                    size="xs"
                                                    color={STATUS_COLORS[retention.status]}
                                                    variant="light"
                                                >
                                                    {STATUS_LABELS[retention.status]}
                                                </Badge>
                                            </Stack>
                                        </Table.Td>
                                    );
                                })}
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                {/* === PAGINATION === */}
                <Box
                    px="sm"
                    py="xs"
                    style={{
                        borderTop: "1px solid var(--mantine-color-default-border)",
                        background: "var(--mantine-color-gray-0)",
                    }}
                >
                    <Group justify="space-between" wrap="wrap" gap={8}>
                        <Text size="xs" c="dimmed">
                            Hiển thị{" "}
                            <b>
                                {(page - 1) * Number(pageSize) + 1}–{Math.min(page * Number(pageSize), filteredSchools.length)}
                            </b>{" "}
                            trong tổng <b>{filteredSchools.length}</b> trường
                        </Text>

                        <Pagination
                            total={Math.ceil(filteredSchools.length / Number(pageSize))}
                            value={page}
                            onChange={setPage}
                            size="sm"
                            radius="md"
                        />

                        <Group gap={6}>
                            <Select
                                data={["10", "20", "30", "50", "100"]}
                                value={pageSize}
                                onChange={(value) => {
                                    setPageSize(value || "10");
                                    setPage(1); // Reset về trang 1 khi thay đổi số lượng
                                }}
                                w={70}
                                size="xs"
                            />
                            <Text size="xs" c="dimmed">
                                / trang
                            </Text>
                        </Group>
                    </Group>
                </Box>
            </Paper>
        </Stack>
    );
}