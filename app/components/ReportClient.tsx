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
import QuickFilterTabs from "./report/QuickFilterTabs";
import {
    DEFAULT_PERIODS,
    SCHOOL_LEVEL_COLOR,
    STATUS_COLORS,
    STATUS_LABELS,
    calcRetentionPercent,
    getRetentionColor,
    normalizeSchools,
    aggregateSchoolsByPeriod,
    aggregateSchoolsByGroup,
    type RetentionStatus,
    type School,
    type SheetRow,
} from "@/lib/report-data";

interface StatItem {
    label: string;
    value: number;
    icon: React.FC<{ size?: number; color?: string }>;
    percent: string | null;
    trend: string | null;
    trendType: "up" | "down" | "neutral";
    accentColor: string;
}
function buildOverviewStats(schools: School[], period: string, previousPeriod?: string): StatItem[] {
    const current = aggregateSchoolsByPeriod(schools, period);
    const previous = previousPeriod ? aggregateSchoolsByPeriod(schools, previousPeriod) : null;
    const total = Math.max(schools.length, 1);

    const trendFor = (currentValue: number, previousValue: number | null) => {
        if (previousValue === null) return { trend: null, trendType: "neutral" as const };
        const delta = currentValue - previousValue;
        if (delta > 0) return { trend: `+${delta}`, trendType: "up" as const };
        if (delta < 0) return { trend: `${delta}`, trendType: "down" as const };
        return { trend: null, trendType: "neutral" as const };
    };

    const percent = (value: number) => `${Math.round((value / total) * 100)}%`;

    return [
        { label: "Tổng trường", value: total, icon: IconBuildings, percent: null, ...trendFor(total, previous ? previous.tong : null), accentColor: "blue" },
        { label: "Đăng ký mới", value: current.moi, icon: IconBuildingPlus, percent: percent(current.moi), ...trendFor(current.moi, previous ? previous.moi : null), accentColor: "green" },
        { label: "Gia hạn", value: current.giaHan, icon: IconBuildingCommunity, percent: percent(current.giaHan), ...trendFor(current.giaHan, previous ? previous.giaHan : null), accentColor: "violet" },
        { label: "Chưa triển khai", value: current.chuaTrienKhai, icon: IconHomeHand, percent: percent(current.chuaTrienKhai), ...trendFor(current.chuaTrienKhai, previous ? previous.chuaTrienKhai : null), accentColor: "yellow" },
        { label: "Hủy đăng ký", value: current.huy, icon: IconBuildingMinus, percent: percent(current.huy), ...trendFor(current.huy, previous ? previous.huy : null), accentColor: "red" },
    ];
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
    data: Array<Record<string, string | number>>;
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
function SchoolDetailModal({ school, opened, onClose, periods }: {
    school: School | null;
    opened: boolean;
    onClose: () => void;
    periods: string[];
}) {
    if (!school) return null;

    const levelColor = SCHOOL_LEVEL_COLOR[school.schoolLevel] ?? "gray";

    // Tổng hợp toàn bộ giai đoạn
    const totalNew       = periods.reduce((s, p) => s + (school.periods[p]?.newStudents ?? 0), 0);
    const totalRenewed   = periods.reduce((s, p) => s + (school.periods[p]?.renewed    ?? 0), 0);
    const totalCancelled = periods.reduce((s, p) => s + (school.periods[p]?.cancelled  ?? 0), 0);
    const totalGraduated = periods.reduce((s, p) => s + (school.periods[p]?.graduated  ?? 0), 0);

    // Overall retention (kỳ đầu → kỳ cuối có học sinh)
    const periodsWithStudents = periods.filter(p => (school.periods[p]?.students ?? 0) > 0);
    const firstStudents = periodsWithStudents.length > 0
        ? school.periods[periodsWithStudents[0]].students : 0;
    const lastStudents = periodsWithStudents.length > 0
        ? school.periods[periodsWithStudents[periodsWithStudents.length - 1]].students : 0;
    const overallPct   = firstStudents > 0 ? Math.round((lastStudents / firstStudents) * 100) : 0;
    const overallColor = getRetentionColor(overallPct);

    // Build line chart data
    const lineData = periods.map((period, idx) => {
        const data     = school.periods[period];
        const prevData = idx > 0 ? school.periods[periods[idx - 1]] : undefined;
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
                                {periods.map((period, idx) => {
                                    const data     = school.periods[period];
                                    const prevData = idx > 0 ? school.periods[periods[idx - 1]] : undefined;
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
                            content: (props) => {
                                const payload = props.payload as ReadonlyArray<{ name?: string; color?: string; value?: number | string | null }> | undefined;
                                const label = props.label;
                                if (!payload?.length) return null;
                                return (
                                    <Paper p="xs" withBorder shadow="sm" radius="sm" style={{ minWidth: 200 }}>
                                        <Text size="xs" fw={700} mb={6}>{label}</Text>
                                        <Stack gap={4}>
                                            {payload.map((entry) => (
                                                <Group key={entry.name ?? "value"} gap={6} justify="space-between">
                                                    <Group gap={4}>
                                                        <Box
                                                            w={8}
                                                            h={8}
                                                            style={{ borderRadius: 2, background: entry.color, flexShrink: 0 }}
                                                        />
                                                        <Text size="xs" c="dimmed">{entry.name ?? ""}</Text>
                                                    </Group>
                                                    <Text size="xs" fw={600}>
                                                        {entry.value === null || entry.value === undefined
                                                            ? "—"
                                                            : entry.name?.includes("%")
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
export default function ReportClient({ initialData, initialRetentionRows, initialPeriods, initialAreas, initialBusinesses, initialSchoolLevels }: { initialData?: SheetRow[], initialRetentionRows?: SheetRow[], initialPeriods?: string[], initialAreas?: string[], initialBusinesses?: string[], initialSchoolLevels?: string[] }) {
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

    const periods = (initialPeriods && initialPeriods.length) ? initialPeriods : DEFAULT_PERIODS;
    const schools = useMemo(
        () => normalizeSchools(initialData ?? [], initialRetentionRows ?? [], periods),
        [initialData, initialRetentionRows, periods],
    );
    

    // Build select option lists and ensure values are unique (Mantine Select rejects duplicates)
    const uniq = (arr: (string | undefined)[]) => Array.from(new Set((arr || []).filter(Boolean).map(s => String(s).trim())));
    const areaList = uniq(initialAreas ?? []);
    const businessList = uniq(initialBusinesses ?? []);
    const schoolLevelList = uniq(initialSchoolLevels ?? []);

    const areaOptions = ["Tất cả", ...areaList.filter(v => v !== "Tất cả")];
    const businessOptions = ["Tất cả", ...businessList.filter(v => v !== "Tất cả")];
    const schoolLevelOptions = ["Tất cả", ...schoolLevelList.filter(v => v !== "Tất cả")];

    const [areaFilter, setAreaFilter] = useState<string>(areaOptions[0] ?? "Tất cả");
    const [businessFilter, setBusinessFilter] = useState<string>(businessOptions[0] ?? "Tất cả");
    const [schoolLevelFilter, setSchoolLevelFilter] = useState<string>(schoolLevelOptions[0] ?? "Tất cả");

    const openDetail = (school: School) => {
        setSelectedSchool(school);
        setModalOpened(true);
    };

    const [currentPeriod, setCurrentPeriod] = useState<string>(periods[0]);

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
    const quickFilterItems = useMemo(() => [
        { label: "Trường", count: schools.length, color: "blue", icon: IconBuildings },
        {
            label: "Học sinh",
            count: schools.reduce((total, school) => total + Object.values(school.periods).reduce((periodTotal, period) => periodTotal + period.students, 0), 0),
            color: "green",
            icon: IconSchool,
        },
    ], [schools]);

    const filteredSchools = useMemo(() => {
        const kw = search.toLowerCase().trim();
        return schools.filter(s => {
            const matchSearch =
                s.schoolName.toLowerCase().includes(kw) ||
                s.id.toLowerCase().includes(kw) ||
                s.area.toLowerCase().includes(kw) ||
                s.province.toLowerCase().includes(kw) ||
                s.ward.toLowerCase().includes(kw);

            const matchStatus =
                !statusFilter ||
                Object.values(s.periods).some(p => p.status === statusFilter);

            const matchArea = !areaFilter || areaFilter === "Tất cả" || s.area === areaFilter;
            const matchBusiness = !businessFilter || businessFilter === "Tất cả" || s.businessName === businessFilter;
            const matchLevel = !schoolLevelFilter || schoolLevelFilter === "Tất cả" || s.schoolLevel === schoolLevelFilter;

            const currentStudents = s.periods[currentPeriod]?.students ?? 0;
            const matchQuick = !activeQuickFilter || activeQuickFilter === "Trường"
                ? true
                : activeQuickFilter === "Học sinh"
                ? currentStudents > 0
                : true;

            return matchSearch && matchStatus && matchArea && matchBusiness && matchLevel && matchQuick;
        });
    }, [schools, search, statusFilter, areaFilter, businessFilter, schoolLevelFilter, activeQuickFilter, currentPeriod]);

    const paginatedSchools = useMemo(() => {
        const start = (page - 1) * Number(pageSize);
        return filteredSchools.slice(start, start + Number(pageSize));
    }, [filteredSchools, page, pageSize]);

    // Derive dashboard aggregations from the currently filtered schools
    const derivedOverviewStats = useMemo(() => {
        const overviewPeriod = currentPeriod ?? periods[periods.length - 1];
        const previousOverviewPeriod = periods[periods.indexOf(overviewPeriod) - 1];
        return buildOverviewStats(filteredSchools, overviewPeriod, previousOverviewPeriod);
    }, [filteredSchools, currentPeriod, periods]);

    const retentionByPeriodFiltered = useMemo(() => {
        return periods.map(period => aggregateSchoolsByPeriod(filteredSchools, period));
    }, [filteredSchools, periods]);

    const retentionByAreaFiltered = useMemo(() => {
        const overviewPeriod = currentPeriod ?? periods[periods.length - 1];
        return aggregateSchoolsByGroup(filteredSchools, overviewPeriod, "area", "area");
    }, [filteredSchools, currentPeriod, periods]);

    const retentionByBusinessFiltered = useMemo(() => {
        const overviewPeriod = currentPeriod ?? periods[periods.length - 1];
        return aggregateSchoolsByGroup(filteredSchools, overviewPeriod, "businessName", "business");
    }, [filteredSchools, currentPeriod, periods]);

    const retentionBySchoolLevelFiltered = useMemo(() => {
        const overviewPeriod = currentPeriod ?? periods[periods.length - 1];
        return aggregateSchoolsByGroup(filteredSchools, overviewPeriod, "schoolLevel", "schoolLevel");
    }, [filteredSchools, currentPeriod, periods]);

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
                            <SegmentedControl data={periods} value={currentPeriod} onChange={setCurrentPeriod} size="sm" radius="md" />
                        </Group>
                        <Group gap="sm" wrap="nowrap">
                            <Select placeholder="Khu vực"   data={areaOptions}    value={areaFilter}    onChange={(v) => setAreaFilter(v ?? "Tất cả")}    leftSection={<IconMapPin   size={16} />} />
                            <Select placeholder="Kinh doanh" data={businessOptions} value={businessFilter} onChange={(v) => setBusinessFilter(v ?? "Tất cả")} leftSection={<IconBriefcase size={16} />} />
                            <Select placeholder="Cấp học"   data={schoolLevelOptions} value={schoolLevelFilter} onChange={(v) => setSchoolLevelFilter(v ?? "Tất cả")} leftSection={<IconBookmark  size={16} />} />
                        </Group>
                    </Group>
                    <Box mt="md">
                        <QuickFilterTabs items={quickFilterItems} active={activeQuickFilter} onChange={setActiveQuickFilter} />
                    </Box>
                </Paper>

                {/* ── Tổng quan ── */}
                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Text fw={700} size="md" tt="uppercase" c="dimmed" mb="md">TỔNG QUAN</Text>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                        {derivedOverviewStats.map(stat => <StatCard key={stat.label} stat={stat} />)}
                    </SimpleGrid>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
                        <RetentionBarChart title="Retention theo giai đoạn" data={retentionByPeriodFiltered}      dataKey="period"      />
                        <RetentionBarChart title="Retention theo khu vực"   data={retentionByAreaFiltered}        dataKey="area"        />
                        <RetentionBarChart title="Retention theo kinh doanh" data={retentionByBusinessFiltered}   dataKey="business"    />
                        <RetentionBarChart title="Retention theo cấp học"   data={retentionBySchoolLevelFiltered} dataKey="schoolLevel" />
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
                                                    const ret      = school.periods[period];
                                                    const prev     = pIdx > 0 ? school.periods[periods[pIdx - 1]] : undefined;
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