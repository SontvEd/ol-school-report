import { Tabs, Group, Text } from '@mantine/core';
import type { FC } from 'react';

export interface QuickFilterTabItem {
    label: string;
    count: number;
    color: string;
    icon: FC<{ size?: number }>;
}

interface QuickFilterTabsProps {
    items: QuickFilterTabItem[];
    active: string | null;
    onChange: (value: string | null) => void;
}

export default function QuickFilterTabs({ items, active, onChange }: QuickFilterTabsProps) {
    if (!items.length) return null;

    const value = active ?? items[0].label;

    return (
        <Tabs value={value} onChange={onChange} variant="pills" radius="md">
            <Tabs.List>
                {items.map(item => {
                    const { label, count, color, icon: Icon } = item;
                    const isActive = value === label;
                    return (
                        <Tabs.Tab
                            key={label}
                            value={label}
                            leftSection={<Icon size={16} />}
                            style={{
                                cursor: "pointer",
                                border: `1.5px solid var(--mantine-color-${color}-${isActive ? "9" : "3"})`,
                                background: isActive
                                    ? `var(--mantine-color-${color}-light)`
                                    : `var(--mantine-color-${color}-0)`,
                                color: `var(--mantine-color-${color}-${isActive ? "9" : "6"})`,
                                padding: "6px 10px",
                                borderRadius: 8,
                            }}
                        >
                            <Group gap={6} wrap="nowrap">
                                <Text size="sm" fw={600}>{label}</Text>
                                <Text size="xs" c="dimmed">({count})</Text>
                            </Group>
                        </Tabs.Tab>
                    );
                })}
            </Tabs.List>
        </Tabs>
    );
}
