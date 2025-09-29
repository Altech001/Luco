'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import PersonalizedVouchers from '@/components/personalized-vouchers';
import PromotionalBanners from '@/components/promotional-banners';
import VoucherList from '@/components/voucher-list';
import { vouchers as allVouchers, voucherCategoriesData } from '@/lib/data';

export default function Home() {
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');

  const handleGetRecommendations = (ids: string[]) => {
    setRecommendedIds(ids);
    setFilter('recommended');
  };

  const vouchersToShow = filter === 'recommended' 
    ? allVouchers.filter(v => recommendedIds.includes(v.id)) 
    : allVouchers;

  const handleTabChange = (tab: string) => {
    if (tab === 'all') {
      setFilter('all');
      setRecommendedIds([]);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PromotionalBanners />
          
          <div className="my-12">
            <PersonalizedVouchers onRecommendations={handleGetRecommendations} />
          </div>

          <VoucherList
            key={filter}
            vouchers={vouchersToShow}
            categories={voucherCategoriesData}
            highlightedVoucherIds={recommendedIds}
            onTabChange={handleTabChange}
            initialTab={filter === 'recommended' ? undefined : 'all'}
          />
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Luco Coupons. All rights reserved.
      </footer>
    </div>
  );
}
