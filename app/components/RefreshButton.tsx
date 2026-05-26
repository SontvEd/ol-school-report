'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Tooltip } from '@mantine/core';
import { IconReload } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetch('/api/revalidate', { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip label={loading ? 'Đang tải...' : 'Cập nhật dữ liệu'} withArrow>
      <Button
        onClick={handleRefresh}
        loading={loading}
        variant="light"
        color="blue"
        size="sm"
        px={isMobile ? 'xs' : undefined}
      >
        {!loading && <IconReload size={16} />}
        {!isMobile && (loading ? ' Đang tải...' : ' Cập nhật dữ liệu')}
      </Button>
    </Tooltip>
  );
}