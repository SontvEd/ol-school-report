// app/page.tsx
import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";
import { Box, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import ReportClient from "./components/ReportClient";

export const revalidate = 0;

async function Home() {
  const data = await getSheetData("Trường");
  const settingsRows = await getSheetData("0. Setting", { headerRow: 1, startRow: 2 }).catch(() => []);

  const periods = Array.from(new Set(settingsRows.map((r: any) => r["Giai đoạn"]).filter(Boolean)));
  const areas = Array.from(new Set(settingsRows.map((r: any) => r["Khu vực"]).filter(Boolean)));
  const businesses = Array.from(new Set(settingsRows.map((r: any) => r["Kinh doanh"]).filter(Boolean)));
  const schoolLevels = Array.from(new Set(settingsRows.map((r: any) => r["Cấp học"]).filter(Boolean)));

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
        initialData={data}
        initialPeriods={periods}
        initialAreas={areas}
        initialBusinesses={businesses}
        initialSchoolLevels={schoolLevels}
      />
    </Suspense>
  );
}

export default Home;