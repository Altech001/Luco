
'use client';
import { useState, useEffect, useMemo } from 'react';
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

function getYouTubeEmbedUrl(url: string): string | null {
  let videoId = null;
  const urlParts = new URL(url);
  
  if (urlParts.hostname === 'youtu.be') {
    videoId = urlParts.pathname.slice(1);
  } else if (urlParts.hostname === 'www.youtube.com' || urlParts.hostname === 'youtube.com') {
    if (urlParts.pathname === '/watch') {
      videoId = urlParts.searchParams.get('v');
    } else if (urlParts.pathname.startsWith('/embed/')) {
      videoId = urlParts.pathname.split('/embed/')[1];
    }
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0` : null;
}

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);
  
  const bannerItems = useMemo(() => banners.map(banner => {
    const embedUrl = banner.videoUrl ? getYouTubeEmbedUrl(banner.videoUrl) : null;
    return { ...banner, embedUrl };
  }), [banners]);

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="aspect-video sm:aspect-[3/1] w-full rounded-lg" />
      </div>
    );
  }

  if (bannerItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel 
        opts={{ loop: true }}
        plugins={[
            Autoplay({
              delay: 6000,
              stopOnInteraction: true,
            }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {bannerItems.map((banner, index) => (
            <CarouselItem key={banner.id}>
              <Card className="overflow-hidden">
                <CardContent className="relative aspect-video sm:aspect-[3/1] p-0">
                  {banner.embedUrl ? (
                     <iframe
                        src={banner.embedUrl}
                        title={banner.description}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                  ) : (
                    <Image
                      src={banner.imageUrl}
                      alt={banner.description}
                      fill
                      className="object-cover"
                      data-ai-hint={banner.imageHint}
                      priority={index === 0}
                    />
                  )}
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
