"use client";

import { useEffect, useState } from "react";
import {
    Group, Image, Paper, Stack, Title, Text, SimpleGrid, Badge,
    Skeleton, Box, Divider, Progress, Pill, Select, SegmentedControl,
    Grid,
    ThemeIcon,
    TextInput,
} from "@mantine/core";
import { BarChart } from '@mantine/charts';
import '@mantine/charts/styles.css';
import {
    IconArrowDown, IconArrowUp, IconBookmark, IconBriefcase,
    IconBuildingCommunity, IconBuildingMinus, IconBuildingPlus,
    IconBuildings, IconCalendar, IconClockCheck, IconHomeHand,
    IconMapPin, IconMinus, IconSchool, IconSearch, IconUsers
} from "@tabler/icons-react";
import { useMediaQuery } from '@mantine/hooks';

import RefreshButton from "./RefreshButton";
// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem {
    label: string;
    value: number;
    icon: React.FC<{ size?: number; color?: string }>;
    percent: string | null;
    trend: string | null;
    trendType: "up" | "down" | "neutral";
    accentColor: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const PERIODS = ["2023-2026", "2025-2026", "2024-2025", "2023-2024"];

const retentionByPeriod = [
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

// ─── Sub-components ─────────────────────
function StatCard({ stat }: { stat: StatItem }) {
    const Icon = stat.icon;
    const ac = stat.accentColor; // shorthand

    // Trend arrow + color
    const trendColor =
        stat.trendType === "up"
            ? "green.7"
            : stat.trendType === "down"
                ? "red.7"
                : "dimmed";

    const TrendIcon =
        stat.trendType === "up"
            ? IconArrowUp
            : stat.trendType === "down"
                ? IconArrowDown
                : null;

    return (
        <Paper
            withBorder
            p="sm"
            radius="md"
            style={{
                borderTopWidth: 3,
                borderTopColor: `var(--mantine-color-${ac}-5)`,
            }}
        >
            <Stack gap={4}>
                {/* Icon + Label */}
                <Group gap={4} align="center" wrap="nowrap">
                    <Icon size={14} color={`var(--mantine-color-${ac}-6)`} />
                    <Text size="sm" lh={1.3} truncate c={`var(--mantine-color-${ac}-6)`}>
                        {stat.label}
                    </Text>
                </Group>

                {/* Value — dùng màu accent */}
                <Text
                    size="xl"
                    fw={600}
                    lh={1.1}
                    c={`${ac}.7`}
                >
                    {stat.value}
                </Text>

                {/* Sub row: % trái — trend phải */}
                <Group justify="space-between" gap={4} wrap="nowrap">
                    {/* Trái: tỷ lệ % hoặc để trống */}
                    <Pill
                        size="xs"
                        c={stat.percent ? `${ac}.9` : undefined}
                        bg={stat.percent ? `${ac}.1` : "#fff"}
                    >
                        {stat.percent ?? ""}
                    </Pill>

                    {/* Phải: biến động vs kỳ trước */}
                    {stat.trend ? (
                        <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
                            {TrendIcon && (
                                <TrendIcon
                                    size={10}
                                    color={
                                        stat.trendType === "up"
                                            ? "var(--mantine-color-green-9)"
                                            : "var(--mantine-color-red-9)"
                                    }
                                />
                            )}
                            <Text size="xs" c={trendColor}>
                                {stat.trend}
                            </Text>
                            <Text size="xs" c="gray"> vs kỳ trước</Text>
                        </Group>
                    ) : (
                        <span />
                    )}
                </Group>
            </Stack>
        </Paper>
    );
}

function RetentionGrid({ items }: { items: { label: string; value: number; color: string }[] }) {
    return (
        <SimpleGrid cols={2} spacing="sm">
            {items.map((item) => (
                <Paper key={item.label} withBorder p="sm" radius="md" ta="center">
                    <Text size="xs" fw={600} c="dimmed" mb={4}>{item.label}</Text>
                    <Title order={3} fw={700} c={`${item.color}.7`}>{item.value}%</Title>
                    <Progress value={item.value} color={item.color} size="sm" radius="xl" mt={6} />
                </Paper>
            ))}
        </SimpleGrid>
    );
}

function SectionTitle({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <Group gap={8} mb="sm">
            <ThemeIcon size="sm" variant="light" color="blue" radius="sm">
                {icon}
            </ThemeIcon>
            <Text fw={600} size="sm">
                {title}
            </Text>
        </Group>
    );
}

// ─── Main Client Component ───────────────────────────────────────
export default function ReportClient({ initialData }: { initialData: any }) {
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>("Trường");
    const [isScrolled, setIsScrolled] = useState(false);
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const now = new Date();
    const vietnamTime = now.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80); // thay đổi màu khi cuộn quá 80px
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Stack gap="lg" px="md" maw={1200} mx="auto">
            {/* Header */}
            <Paper withBorder p="md" radius="md" shadow="xs" mt={10}>
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm">
                        {!isMobile && (<Image
                            src="/Logo_at-02.png"
                            alt="Logo"
                            h={48}
                            w="auto"
                            fit="contain"
                            fallbackSrc="https://placehold.co/120x48?text=Logo"
                        />)}
                        <Divider orientation="vertical" />
                        <Stack gap={2}>
                            <Title order={2} fw={700}>
                                Tái đăng ký app Ôn luyện
                            </Title>
                            <Text size="sm" c="blue.6" fw={500}>
                                Giai đoạn 2023 – 2026
                            </Text>
                            <Group gap={6}>
                                <IconClockCheck size={14} color="gray" />
                                <Text size="xs" c="dimmed">
                                    Cập nhật dữ liệu lần cuối: {vietnamTime}
                                </Text>
                            </Group>
                        </Stack>
                    </Group>
                    <RefreshButton />
                </Group>
            </Paper>

            {/* Sticky Filter Header */}
            <Box
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backgroundColor: isScrolled ? "var(--mantine-color-gray-2)" : "white",
                    borderBottom: isScrolled
                        ? "1px solid var(--mantine-color-gray-2)"
                        : "1px solid var(--mantine-color-gray-3)",
                    transition: "background-color 0.2s ease, border-bottom 0.2s ease",
                    marginTop: "10px",
                    paddingBottom: "8px",
                }}
            >
                <Paper
                    withBorder
                    p="md"
                    radius="md"
                    shadow={isScrolled ? "sm" : "xs"}
                    style={{
                        backgroundColor: "transparent",
                        border: "none",
                    }}
                >
                    <Group gap="md" wrap="wrap" justify="space-between">
                        <Group gap={10}>
                            <Group gap={6}>
                                <IconCalendar size={20} />
                                <Text size="md" fw={500} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                                    Giai đoạn
                                </Text>
                            </Group>
                            <SegmentedControl
                                data={PERIODS}
                                defaultValue={PERIODS[0]}
                                size="sm"
                                radius="md"
                            />
                        </Group>

                        <Group wrap="nowrap">
                            <Select
                                size="sm"
                                placeholder="Khu vực"
                                data={["Tất cả", "KV1", "KV2", "KV3", "KV4"]}
                                defaultValue="Tất cả"
                                leftSection={<IconMapPin size={16} />}
                                maw={140}
                            />
                            <Select
                                size="sm"
                                placeholder="Kinh doanh"
                                data={["Tất cả", "KD1", "KD2", "KD3", "KD4"]}
                                defaultValue="Tất cả"
                                leftSection={<IconBriefcase size={16} />}
                                maw={140}
                            />
                            <Select
                                size="sm"
                                placeholder="Cấp học"
                                data={["Tất cả", "Tiểu học", "THCS", "THPT", "Liên cấp"]}
                                defaultValue="Tất cả"
                                leftSection={<IconBookmark size={16} />}
                                maw={140}
                            />
                        </Group>
                    </Group>

                    {/* Quick Filters */}
                    <Group gap="sm" mt="sm">
                        {QUICK_FILTERS.map(({ label, count, color, icon: Icon }) => (
                            <Pill
                                size="sm"
                                key={label}
                                onClick={() =>
                                    setActiveQuickFilter(activeQuickFilter === label ? null : label)
                                }
                                style={{
                                    cursor: "pointer",
                                    outline: activeQuickFilter === label
                                        ? `1.5px solid var(--mantine-color-${color}-9)`
                                        : `1.5px solid var(--mantine-color-${color}-3)`,
                                    background: activeQuickFilter === label
                                        ? `var(--mantine-color-${color}-light)`
                                        : `var(--mantine-color-${color}-0)`,
                                    color: activeQuickFilter === label
                                        ? `var(--mantine-color-${color}-9)`
                                        : `var(--mantine-color-${color}-3)`,
                                }}
                            >
                                <Group gap={4} align="center" wrap="nowrap">
                                    <Icon size={20} />
                                    <Text>{label} ({count})</Text>
                                </Group>
                            </Pill>
                        ))}
                    </Group>
                </Paper>
            </Box>

            <Paper withBorder p="md" radius="md" shadow="xs">
                <Stack gap="xs">
                    <Text fw={700} size="md" tt="uppercase" c="dimmed">
                        Tổng Quan
                    </Text>

                    {/* ── KPI ── */}
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                        {STATS.map((s) => (
                            <StatCard key={s.label} stat={s} />
                        ))}
                    </SimpleGrid>

                    {/* ── BIỂU ĐỒ RETENTION ── */}
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                        {/* 1. Biểu đồ cột - Retention theo giai đoạn */}
                        <Paper withBorder p="md" radius="md" shadow="xs">
                            <Title order={4} mb="md">Retention theo giai đoạn</Title>
                            <BarChart
                                h={300}
                                data={retentionByPeriod}
                                dataKey="period"
                                withLegend
                                legendProps={{
                                    verticalAlign: 'bottom',
                                    wrapperStyle: {
                                        paddingTop: '10px',
                                        fontSize: '13px',
                                    },
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

                        {/* 2. Biểu đồ cột - Retention theo khu vực */}
                        <Paper withBorder p="md" radius="md" shadow="xs">
                            <Title order={4} mb="md">Retention theo khu vực</Title>
                            <BarChart
                                h={300}
                                data={retentionByArea}
                                dataKey="area"
                                withLegend
                                legendProps={{
                                    verticalAlign: 'bottom',
                                    wrapperStyle: {
                                        paddingTop: '10px',
                                        fontSize: '13px',
                                    },
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

                        {/* 3. Biểu đồ cột - Retention theo kinh doanh */}
                        <Paper withBorder p="md" radius="md" shadow="xs">
                            <Title order={4} mb="md">Retention theo kinh doanh</Title>
                            <BarChart
                                h={300}
                                data={retentionByBusiness}
                                dataKey="business"
                                withLegend
                                legendProps={{
                                    verticalAlign: 'bottom',
                                    wrapperStyle: {
                                        paddingTop: '10px',
                                        fontSize: '13px',
                                    },
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

                        {/* 4. Biểu đồ cột - Retention theo cấp học */}
                        <Paper withBorder p="md" radius="md" shadow="xs">
                            <Title order={4} mb="md">Retention theo cấp học</Title>
                            <BarChart
                                h={300}
                                data={retentionBySchoolLevel}
                                dataKey="schoolLevel"
                                withLegend
                                legendProps={{
                                    verticalAlign: 'bottom',
                                    wrapperStyle: {
                                        paddingTop: '10px',
                                        fontSize: '13px',
                                    },
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
                    </SimpleGrid>
                </Stack>

            </Paper>

            <Paper withBorder p="md" radius="md" shadow="xs">
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Text fw={700} size="md" tt="uppercase" c="dimmed">
                            Chi tiết trường (56)
                        </Text>
                        <Group gap={8}>
                            <TextInput
                                placeholder="Tìm trường..."
                                leftSection={<IconSearch size={14} />}
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                size="xs"
                                w={180}
                            />
                            <Select
                                placeholder="Trạng thái"
                                data={[
                                    { value: "tatCa", label: "Tất cả" },
                                    { value: "", label: "Thành viên" },
                                    { value: "trial", label: "Thử việc" },
                                ]}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                clearable
                                size="xs"
                                w={130}
                            />
                        </Group>
                    </Group>
                </Stack>
            </Paper>
        </Stack>
    );
}