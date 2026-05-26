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
} from "@mantine/core";
import { IconClockCheck, IconMapPin, IconSchool } from "@tabler/icons-react";

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
    <Stack gap="lg" px="md" maw={1200} mx="auto">
      {/* Header */}
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
                Báo Cáo retention app Ôn luyện
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
            {/* <Stack gap={2}>
              <Title order={2} fw={700}>
                Báo Cáo OL School
              </Title>
              <Group gap={6}>
                <IconClockCheck size={14} color="gray" />
                <Text size="xs" c="dimmed">
                  Cập nhật dữ liệu lần cuối: {vietnamTime}
                </Text>
              </Group>
            </Stack> */}
          </Group>

          <RefreshButton />
        </Group>
      </Paper>

      {/* Stats summary */}
      <Group gap="xs">
        <Badge
          leftSection={<IconSchool size={12} />}
          variant="light"
          color="blue"
          size="lg"
        >
          {data.length} trường
        </Badge>
      </Group>

      {/* Grid cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {data.map((item, index) => (
          <Paper
            key={index}
            withBorder
            p="lg"
            radius="md"
            shadow="xs"
            style={{ transition: "box-shadow 0.2s" }}
          >
            <Stack gap="xs">
              <Group gap={8} wrap="nowrap">
                <IconSchool size={20} color="var(--mantine-color-blue-6)" />
                <Text fw={600} size="md" lineClamp={2}>
                  {item["Tên trường"] || item.Name || "Không có tên"}
                </Text>
              </Group>

              <Divider />

              <Group gap={6}>
                <IconMapPin size={16} color="var(--mantine-color-green-6)" />
                <Text size="xl" fw={700} c="green.7">
                  {item["Tỉnh cũ"] || item.Revenue || "0"}
                </Text>
              </Group>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export default function Home() {
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
      <ReportContent />
    </Suspense>
  );
}