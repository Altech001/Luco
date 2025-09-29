
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from "embla-carousel-autoplay";
import { getBanners } from '@/lib/banners';
import type { Banner } from '@/types';

export default function PromotionalBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const bannersData = await getBanners();
        setBanners(bannersData);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        // Optionally, set some default banners or an error state
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="aspect-[2/1] sm:aspect-[3/1] w-full rounded-lg" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render the carousel if there are no banners
  }

  return (
    <div className="w-full">
      <Carousel 
        opts={{ loop: true }}
        plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <Card className="overflow-hidden">
                <CardContent className="relative aspect-[2/1] sm:aspect-[3/1] p-0">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.description}
                    fill
                    className="object-cover"
                    data-ai-hint={banner.imageHint}
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center shadow-lg">
                        {banner.description}
                    </h2>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4" />
      </Carousel>
    </div>
  );
}
