// app/page.tsx
import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";
import { Box, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import ReportClient from "./components/ReportClient";

export const revalidate = 0;

async function Home() {
  const data = await getSheetData("Trường");
  const retentionRows = await getSheetData("RetentionSchools", { headerRow: 1, startRow: 2 }).catch(() => []);
  const settingsRows = await getSheetData("0. Setting", { headerRow: 1, startRow: 2 }).catch(() => []);

  const uniqueValues = (rows: Array<Record<string, unknown>>, key: string) =>
    Array.from(
      new Set(
        rows
          .map(row => row[key])
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      )
    );

  const periods = uniqueValues(settingsRows as Array<Record<string, unknown>>, "Giai đoạn");
  const areas = uniqueValues(settingsRows as Array<Record<string, unknown>>, "Khu vực");
  const businesses = uniqueValues(settingsRows as Array<Record<string, unknown>>, "Kinh doanh");
  const schoolLevels = uniqueValues(settingsRows as Array<Record<string, unknown>>, "Cấp học");

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
        initialRetentionRows={retentionRows}
        initialPeriods={periods}
        initialAreas={areas}
        initialBusinesses={businesses}
        initialSchoolLevels={schoolLevels}
      />
    </Suspense>
  );
}

export default Home;