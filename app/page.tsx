// app/page.tsx
import { getSheetData } from "@/lib/sheets";
import { Suspense } from "react";
import ReportClient from "./components/ReportClient";   // ← Tách ra
import { Box, SimpleGrid, Skeleton, Stack } from "@mantine/core";

export const revalidate = 0;

async function Home() {
  const data = await getSheetData("Trường");

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
      <ReportClient initialData={data} />
    </Suspense>
  );
}

export default Home;