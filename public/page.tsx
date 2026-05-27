import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";
import RefreshButton from "./components/RefreshButton";
import {
  Group,
  Image,
  Paper,
  Stack,
  Title,
  Text,
  SimpleGrid,
  Badge,
  Skeleton,
  Box,
  Divider,
  Progress,
  Select,
  Tabs,
  RingProgress,
  ThemeIcon,
  Grid,
  SegmentedControl,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconClockCheck,
  IconMinus,
  IconSchool,
  IconUsers,
  IconRefresh,
  IconCalendar,
  IconMapPin,
  IconBriefcase,
  IconBookmark,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PERIODS = ["2023-2026", "2026-2025", "2023-2024", "2029-2023"];

const retentionByPeriod = [
  { period: "2023-2024", giaHan: 88, totNghiep: 62, chuaTrienKhai: 38, huy: 22, tong: 210, moi: 10 },
  { period: "2024-2025", giaHan: 91, totNghiep: 68, chuaTrienKhai: 32, huy: 18, tong: 230, moi: 15 },
  { period: "2025-2026", giaHan: 94, totNghiep: 75, chuaTrienKhai: 25, huy: 14, tong: 250, moi: 20 },
];

const retentionByArea = [
  { label: "KV1", value: 88, color: "blue" },
  { label: "KV2", value: 72, color: "green" },
  { label: "KV3", value: 65, color: "orange" },
  { label: "KV4", value: 80, color: "grape" },
];

const retentionByBusiness = [
  { label: "KD1", value: 91, color: "blue" },
  { label: "KD2", value: 78, color: "green" },
  { label: "KD3", value: 83, color: "orange" },
  { label: "KD4", value: 69, color: "grape" },
];

const retentionBySchoolLevel = [
  { label: "Tiểu học", value: 74, color: "red" },
  { label: "THCS", value: 82, color: "blue" },
  { label: "THPT", value: 88, color: "green" },
  { label: "Liên cấp", value: 91, color: "grape" },
];

// Tổng quan KPI (dựa trên kỳ mới nhất 2025-2026)
const kpiSummary = {
  tongTruong: { value: 56, label: "Trường", color: "blue" },
  hocSinh: { value: 1678, label: "Học sinh", color: "violet" },
  dangKyMoi: { value: 1, sub: "+3 so kỳ trước", trend: "up" as const, color: "green" },
  giaHan: { value: 9, sub: "13% vs kỳ luân", pct: 90, color: "teal" },
  huyDky: { trend: "down" as const, color: "red" },
  chuaTrienKhai: { trend: "neutral" as const, color: "orange" },
  toiNghiep: { trend: "up" as const, color: "grape" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
  trend,
  icon,
  pct,
}: {
  label: string;
  value?: string | number;
  sub?: string;
  color: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  pct?: number;
}) {
  const TrendIcon =
    trend === "up" ? (
      <IconArrowUp size={12} />
    ) : trend === "down" ? (
      <IconArrowDown size={12} />
    ) : (
      <IconMinus size={12} />
    );

  const trendColor =
    trend === "up" ? "green" : trend === "down" ? "red" : "dimmed";

  return (
    <Paper withBorder p="sm" radius="md" h="100%">
      <Group gap={6} mb={6} wrap="nowrap">
        {icon ? (
          <ThemeIcon size="xs" variant="light" color={color} radius="xl">
            {icon}
          </ThemeIcon>
        ) : (
          <Box
            w={10}
            h={10}
            style={{
              borderRadius: "50%",
              background: `var(--mantine-color-${color}-6)`,
              flexShrink: 0,
            }}
          />
        )}
        <Text size="xs" fw={500} c="dimmed" lineClamp={1}>
          {label}
        </Text>
      </Group>

      {value !== undefined && (
        <Title order={3} fw={700} c={`${color}.7`}>
          {value}
        </Title>
      )}

      {pct !== undefined && (
        <Group gap={4} mt={4}>
          <Badge size="sm" color={color} variant="light">
            {pct}%
          </Badge>
        </Group>
      )}

      {sub && (
        <Group gap={4} mt={4}>
          <Text size="xs" c={trendColor} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {TrendIcon} {sub}
          </Text>
        </Group>
      )}

      {value === undefined && pct === undefined && sub === undefined && (
        <Group gap={4} mt={4}>
          <Text size="sm" c="dimmed">~</Text>
          <Text size="sm" c={trendColor}>{TrendIcon}</Text>
          <Text size="sm" c="dimmed">~</Text>
        </Group>
      )}
    </Paper>
  );
}

function RetentionGrid({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  return (
    <SimpleGrid cols={2} spacing="sm">
      {items.map((item) => (
        <Paper key={item.label} withBorder p="sm" radius="md" ta="center">
          <Text size="xs" fw={600} c="dimmed" mb={4}>
            {item.label}
          </Text>
          <Title order={3} fw={700} c={`${item.color}.7`}>
            {item.value}%
          </Title>
          <Progress
            value={item.value}
            color={item.color}
            size="sm"
            radius="xl"
            mt={6}
          />
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export const revalidate = 0;

async function ReportContent() {
  const data = await getSheetData("Trường");

  const now = new Date();
  const vietnamTime = now.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <Stack gap="lg" px="md" maw={1400} mx="auto" pb="xl">
      {/* ── Header ── */}
      <Paper withBorder p="md" radius="md" shadow="xs" mt={10}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Image
              src="/Logo_at-02.png"
              alt="Logo"
              h={48}
              w="auto"
              fit="contain"
              fallbackSrc="https://placehold.co/120x48?text=Logo"
            />
            <Divider orientation="vertical" />
            <Stack gap={2}>
              <Title order={2} fw={700}>
                Báo Cáo Retention App Ôn Luyện
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

      {/* ── Bộ lọc giai đoạn ── */}
      <Paper withBorder p="md" radius="md" shadow="xs">
        <Group gap="md" wrap="wrap" justify="space-bettwen">
          <Group gap={10}>
            <Group gap={6}>
              <IconCalendar size={16} />
              <Text size="sm" fw={600}>
                Giai đoạn:
              </Text>
            </Group>
            <SegmentedControl
              data={PERIODS}
              defaultValue="2023-2026"
              size="sm"
              radius="md"
            />
          </Group>
          <Group>
            <Select
              size="xs"
              placeholder="Khu vực"
              data={["Tất cả", "KV1", "KV2", "KV3", "KV4"]}
              defaultValue="Tất cả"
              leftSection={<IconMapPin size={14} />}
              w={140}
            />
            <Select
              size="xs"
              placeholder="Kinh doanh"
              data={["Tất cả", "KD1", "KD2", "KD3", "KD4"]}
              defaultValue="Tất cả"
              leftSection={<IconBriefcase size={14} />}
              w={140}
            />
            <Select
              size="xs"
              placeholder="Cấp học"
              data={["Tất cả", "Tiểu học", "THCS", "THPT", "Liên cấp"]}
              defaultValue="Tất cả"
              leftSection={<IconBookmark size={14} />}
              w={140}
            />
          </Group>
        </Group>

        {/* Trường & Học sinh badges */}
        <Group gap="sm" mt="sm">
          <Badge
            leftSection={<IconSchool size={12} />}
            variant="light"
            color="blue"
            size="lg"
          >
            Trường (56)
          </Badge>
          <Badge
            leftSection={<IconUsers size={12} />}
            variant="light"
            color="violet"
            size="lg"
          >
            Học sinh (1678)
          </Badge>
          <Badge variant="outline" color="gray" size="sm">
            default / active
          </Badge>
        </Group>
      </Paper>

      {/* ── TỔNG QUAN KPI ── */}
      <Stack gap="xs">
        <Text fw={700} size="md" tt="uppercase" c="dimmed">
          Tổng Quan
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 7 }} spacing="sm">
          <KpiCard
            label="Tổng"
            value="~"
            color="gray"
            icon={<IconUsers size={10} />}
          />
          <KpiCard
            label="Đăng ký mới"
            value={1}
            sub="+3 so kỳ trước"
            trend="up"
            color="green"
            icon={<IconRefresh size={10} />}
          />
          <KpiCard
            label="Gia hạn"
            value={9}
            sub="13% vs kỳ luân"
            pct={90}
            trend="up"
            color="teal"
          />
          <KpiCard
            label="Huỷ đăng ký"
            trend="down"
            color="red"
          />
          <KpiCard
            label="Chưa triển khai"
            trend="neutral"
            color="orange"
          />
          <KpiCard
            label="Tốt nghiệp"
            trend="up"
            color="grape"
          />
          <KpiCard
            label="Tái nghiệp vụ"
            trend="neutral"
            color="indigo"
          />
        </SimpleGrid>
      </Stack>

      {/* ── BIỂU ĐỒ RETENTION ── */}
      <Grid gutter="md">
        {/* Retention theo giai đoạn */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <SectionTitle
              icon={<IconCalendar size={14} />}
              title="Retention theo giai đoạn"
            />
            <Group gap={8} mb="sm" wrap="wrap">
              <Badge variant="dot" color="blue" size="xs">Gia hạn</Badge>
              <Badge variant="dot" color="grape" size="xs">Tốt nghiệp</Badge>
              <Badge variant="dot" color="orange" size="xs">Chưa triển khai</Badge>
              <Badge variant="dot" color="red" size="xs">Huỷ</Badge>
            </Group>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={retentionByPeriod} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="giaHan" fill="#228be6" name="Gia hạn" radius={[3, 3, 0, 0]} />
                <Bar dataKey="totNghiep" fill="#ae3ec9" name="Tốt nghiệp" radius={[3, 3, 0, 0]} />
                <Bar dataKey="chuaTrienKhai" fill="#f76707" name="Chưa TK" radius={[3, 3, 0, 0]} />
                <Bar dataKey="huy" fill="#fa5252" name="Huỷ" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Group gap="xs" justify="center" mt="xs">
              {retentionByPeriod.map((d) => (
                <Text key={d.period} size="xs" c="dimmed">
                  {d.period}
                </Text>
              ))}
            </Group>
          </Paper>
        </Grid.Col>

        {/* Retention theo khu vực */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <SectionTitle
              icon={<IconMapPin size={14} />}
              title="Retention theo khu vực"
            />
            <RetentionGrid items={retentionByArea} />
          </Paper>
        </Grid.Col>

        {/* Retention theo kinh doanh */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <SectionTitle
              icon={<IconBriefcase size={14} />}
              title="Retention theo kinh doanh"
            />
            <RetentionGrid items={retentionByBusiness} />
          </Paper>
        </Grid.Col>

        {/* Retention theo cấp học */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <SectionTitle
              icon={<IconSchool size={14} />}
              title="Retention theo cấp học"
            />
            <RetentionGrid items={retentionBySchoolLevel} />
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <Box mih="100vh" bg="gray.0" py="xl">
          <Stack gap="lg" px="md" maw={1400} mx="auto">
            <Skeleton height={80} radius="md" />
            <Skeleton height={60} radius="md" />
            <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }} spacing="sm">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} height={80} radius="md" />
              ))}
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={280} radius="md" />
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
