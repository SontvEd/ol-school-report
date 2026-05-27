import {
  Stack, Paper, Group, Text, Title, Select, Badge,
  SimpleGrid, Progress, SegmentedControl, ActionIcon,
  Tooltip, Box, Divider,
} from "@mantine/core";
import {
  IconX, IconArrowUp, IconArrowDown, IconMinus,
} from "@tabler/icons-react";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PERIODS = ["2023–2026", "2026–2025", "2023–2024", "2029–2023"];

const retentionByPeriod = [
  { period: "2023–2024", giaHan: 88, taiNghiep: 62, chuaTai: 38, huy: 22 },
  { period: "2024–2025", giaHan: 91, taiNghiep: 68, chuaTai: 32, huy: 18 },
  { period: "2025–2026", giaHan: 94, taiNghiep: 75, chuaTai: 25, huy: 14 },
];

const retentionByKV = [
  { label: "KV1", value: 88, color: "blue" },
  { label: "KV2", value: 72, color: "green" },
  { label: "KV3", value: 65, color: "orange" },
  { label: "KV4", value: 80, color: "grape" },
];

const retentionByKD = [
  { label: "KD1", value: 91, color: "blue" },
  { label: "KD2", value: 78, color: "green" },
  { label: "KD3", value: 83, color: "orange" },
  { label: "KD4", value: 69, color: "grape" },
];

const retentionByCapHoc = [
  { label: "Tiểu học", value: 74, color: "red" },
  { label: "THCS",     value: 82, color: "blue" },
  { label: "THPT",     value: 88, color: "green" },
  { label: "Liên cấp", value: 91, color: "grape" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  const icon =
    trend === "up" ? <IconArrowUp size={12} /> :
    trend === "down" ? <IconArrowDown size={12} /> :
    <IconMinus size={12} />;

  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap={6} mb={4}>
        <Box w={12} h={12} style={{ borderRadius: "50%", background: `var(--mantine-color-${color}-6)` }} />
        <Text size="xs" fw={500} c="dimmed">{label}</Text>
      </Group>
      <Title order={3} fw={700} c={`${color}.7`}>{value}</Title>
      {sub && (
        <Group gap={4} mt={2}>
          <Text size="xs" c={trend === "up" ? "green" : trend === "down" ? "red" : "dimmed"}>
            {icon} {sub}
          </Text>
        </Group>
      )}
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

// ─── Main component ───────────────────────────────────────────────────────────

export function RetentionBody() {
  const [period, setPeriod] = useState(PERIODS[0]);
  const [truongActive, setTruongActive] = useState(true);
  const [hocSinhActive, setHocSinhActive] = useState(true);

  return (
    <Stack gap="lg" px="md" maw={1200} mx="auto" pb="xl">

      {/* Period selector */}
      <Paper withBorder p="sm" radius="md" shadow="xs">
        <Group gap="sm" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>
            Giai đoạn
          </Text>
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={PERIODS}
            size="xs"
          />
        </Group>
      </Paper>

      {/* Filters + entity tags */}
      <Paper withBorder p="sm" radius="md" shadow="xs">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="md" wrap="wrap">
            <Group gap={6}>
              <Text size="xs" c="dimmed" fw={500}>Khu vực</Text>
              <Select
                size="xs"
                w={110}
                data={["Tất cả", "Hà Nội", "TP.HCM", "Đà Nẵng"]}
                defaultValue="Tất cả"
                styles={{ input: { color: "var(--mantine-color-blue-6)", fontWeight: 600 } }}
              />
            </Group>
            <Group gap={6}>
              <Text size="xs" c="dimmed" fw={500}>Kinh doanh</Text>
              <Select
                size="xs"
                w={100}
                data={["Tất cả", "KD1", "KD2", "KD3", "KD4"]}
                defaultValue="Tất cả"
                styles={{ input: { color: "var(--mantine-color-blue-6)", fontWeight: 600 } }}
              />
            </Group>
            <Group gap={6}>
              <Text size="xs" c="dimmed" fw={500}>Cấp học</Text>
              <Select
                size="xs"
                w={120}
                data={["Tất cả", "Tiểu học", "THCS", "THPT", "Liên cấp"]}
                defaultValue="Tất cả"
                styles={{ input: { color: "var(--mantine-color-blue-6)", fontWeight: 600 } }}
              />
            </Group>
          </Group>

          <Group gap="sm">
            <Tooltip label={truongActive ? "Bỏ chọn trường" : "Chọn trường"}>
              <Badge
                variant={truongActive ? "filled" : "outline"}
                color="blue"
                size="lg"
                style={{ cursor: "pointer" }}
                leftSection={
                  <ActionIcon
                    size={14}
                    variant="transparent"
                    color={truongActive ? "white" : "blue"}
                    onClick={() => setTruongActive((v) => !v)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
                onClick={() => setTruongActive((v) => !v)}
              >
                TRƯỜNG (56)
              </Badge>
            </Tooltip>

            <Tooltip label={hocSinhActive ? "Bỏ chọn học sinh" : "Chọn học sinh"}>
              <Badge
                variant={hocSinhActive ? "filled" : "outline"}
                color="blue"
                size="lg"
                style={{ cursor: "pointer" }}
                leftSection={
                  <ActionIcon
                    size={14}
                    variant="transparent"
                    color={hocSinhActive ? "white" : "blue"}
                    onClick={() => setHocSinhActive((v) => !v)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
                onClick={() => setHocSinhActive((v) => !v)}
              >
                HỌC SINH (1678)
              </Badge>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      {/* TỔNG QUAN */}
      <Paper withBorder p="md" radius="md" shadow="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }} mb="sm">
          Tổng quan
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
          <KpiCard label="Tổng"          value="1,678"  color="gray"   />
          <KpiCard label="Đăng ký mới"   value={1}      sub="+3 vs kỳ trước" color="green" trend="up" />
          <KpiCard label="Gia hạn"       value={9}      sub="13% vs kỳ luôn" color="blue"  trend="up" />
          <KpiCard label="Hủy đăng ký"   value="~"      sub="—"        color="red"    trend="neutral" />
          <KpiCard label="Chưa tái đăng" value="~"      sub="—"        color="orange" trend="neutral" />
          <KpiCard label="Tái nghiệp"    value="~"      sub="—"        color="grape"  trend="neutral" />
        </SimpleGrid>
      </Paper>

      {/* Charts row 1 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">

        {/* Retention theo giai đoạn */}
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text fw={700} size="sm" mb="sm">Retention theo giai đoạn</Text>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={retentionByPeriod} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <RTooltip formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="giaHan"    name="Gia hạn"      fill="#228be6" radius={[3,3,0,0]} />
              <Bar dataKey="taiNghiep" name="Tái nghiệp"   fill="#40c057" radius={[3,3,0,0]} />
              <Bar dataKey="chuaTai"   name="Chưa tái đăng" fill="#fd7e14" radius={[3,3,0,0]} />
              <Bar dataKey="huy"       name="Hủy"          fill="#fa5252" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Retention theo khu vực */}
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text fw={700} size="sm" mb="sm">Retention theo khu vực</Text>
          <RetentionGrid items={retentionByKV} />
        </Paper>
      </SimpleGrid>

      {/* Charts row 2 */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">

        {/* Retention theo kinh doanh */}
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text fw={700} size="sm" mb="sm">Retention theo kinh doanh</Text>
          <RetentionGrid items={retentionByKD} />
        </Paper>

        {/* Retention theo cấp học */}
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Text fw={700} size="sm" mb="sm">Retention theo cấp học</Text>
          <RetentionGrid items={retentionByCapHoc} />
        </Paper>
      </SimpleGrid>

    </Stack>
  );
}
