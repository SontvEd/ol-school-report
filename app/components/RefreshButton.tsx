'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition"
    >
      <span className={loading ? 'animate-spin inline-block' : ''}>↻</span>
      {loading ? 'Đang tải...' : 'Làm mới ngay'}
    </button>
  );
}