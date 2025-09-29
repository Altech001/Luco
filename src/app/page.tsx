
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import PersonalizedVouchers from '@/components/personalized-vouchers';
import PromotionalBanners from '@/components/promotional-banners';
import VoucherList from '@/components/voucher-list';
import BottomNavBar from '@/components/layout/bottom-nav';
import { voucherCategoriesData } from '@/lib/data';
import { getVouchers } from '@/lib/vouchers';
import type { Voucher } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      try {
        const vouchersData = await getVouchers();
        setAllVouchers(vouchersData);
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const handleGetRecommendations = (ids: string[]) => {
    setRecommendedIds(ids);
    setFilter('recommended');
    setActiveCategory('all');
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (filter === 'recommended') {
      setFilter('all');
      setRecommendedIds([]);
    }
  };

  const vouchersToShow = filter === 'recommended' 
    ? allVouchers.filter(v => recommendedIds.includes(v.id)) 
    : allVouchers;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PromotionalBanners />
          
          <div className="my-12">
            <PersonalizedVouchers onRecommendations={handleGetRecommendations} />
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ) : (
            <VoucherList
              key={`${filter}-${activeCategory}`}
              vouchers={vouchersToShow}
              categories={voucherCategoriesData}
              highlightedVoucherIds={recommendedIds}
              onTabChange={handleCategoryChange}
              initialTab={activeCategory}
            />
          )}
        </div>
      </main>
      <BottomNavBar 
        categories={voucherCategoriesData} 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />
      <footer className="hidden py-6 text-center text-xs text-muted-foreground md:block">
        © {new Date().getFullYear()} Luco Coupons. All rights reserved.
      </footer>
    </div>
  );
}
