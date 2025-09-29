// src/components/layout/bottom-nav.tsx
'use client';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VoucherCategory } from '@/types';

type BottomNavBarProps = {
  categories: VoucherCategory[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function BottomNavBar({
  categories,
  activeCategory,
  onCategoryChange,
}: BottomNavBarProps) {
  const allCategories = [{ name: 'All' as const, icon: Home }, ...categories];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="grid h-16 grid-cols-6">
        {allCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategoryChange(cat.name.toLowerCase().replace(' ', ''))}
            className={cn(
              'inline-flex flex-col items-center justify-center px-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              (activeCategory === cat.name.toLowerCase().replace(' ', '')) && 'text-[hsl(var(--highlight))] bg-accent'
            )}
          >
            <cat.icon className="mb-1 h-5 w-5" />
            <span className="text-[10px]">{cat.name === 'Luco Day' ? 'Day' : cat.name === 'Luco Week' ? 'Week' : cat.name === 'Luco Month' ? 'Month' : cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
