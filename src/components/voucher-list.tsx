'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoucherCard from './voucher-card';
import type { Voucher, VoucherCategory } from '@/types';

type VoucherListProps = {
  vouchers: Voucher[];
  categories: VoucherCategory[];
  highlightedVoucherIds?: string[];
  onTabChange?: (tab: string) => void;
  initialTab?: string;
};

export default function VoucherList({
  vouchers,
  categories,
  highlightedVoucherIds = [],
  onTabChange,
  initialTab = 'all'
}: VoucherListProps) {
  const allCategories = [{ name: 'All' as const, icon: categories[0].icon }, ...categories];
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleValueChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };
  
  const filteredVouchers = (categoryName: string) => {
    if (categoryName === 'All' || categoryName === 'all') return vouchers;
    return vouchers.filter(v => v.category === categoryName);
  };

  return (
    <div>
      <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">Available Vouchers</h2>
      <Tabs defaultValue={initialTab} className="mt-4" onValueChange={handleValueChange}>
        <TabsList className="h-auto flex-wrap justify-start">
          {allCategories.map(cat => (
            <TabsTrigger key={cat.name} value={cat.name.toLowerCase().replace(' ', '')} className="w-full justify-start text-xs sm:w-auto sm:justify-center sm:text-sm">
              <cat.icon className="mr-2 h-4 w-4" />
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {allCategories.map(cat => (
          <TabsContent key={cat.name} value={cat.name.toLowerCase().replace(' ', '')}>
             {filteredVouchers(cat.name).length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                <AnimatePresence>
                  {filteredVouchers(cat.name).map((voucher, index) => (
                    <motion.div
                      key={voucher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <VoucherCard
                        voucher={voucher}
                        isHighlighted={highlightedVoucherIds.includes(voucher.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
                <div className="mt-12 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-20 text-center">
                    <h3 className="font-headline text-xl font-semibold">No Vouchers Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        There are no vouchers in this category right now. Check back soon!
                    </p>
                </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
