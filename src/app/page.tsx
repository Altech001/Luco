
'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import PersonalizedVouchers from '@/components/personalized-vouchers';
import PromotionalBanners from '@/components/promotional-banners';
import VoucherList from '@/components/voucher-list';
import BottomNavBar from '@/components/layout/bottom-nav';
import { vouchers as allVouchers, voucherCategoriesData } from '@/lib/data';

export default function Home() {
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');
  const [activeCategory, setActiveCategory] = useState('all');

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

          <VoucherList
            key={`${filter}-${activeCategory}`}
            vouchers={vouchersToShow}
            categories={voucherCategoriesData}
            highlightedVoucherIds={recommendedIds}
            onTabChange={handleCategoryChange}
            initialTab={activeCategory}
          />
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
