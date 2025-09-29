'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay"


export default function PromotionalBanners() {
  const banners = PlaceHolderImages.filter(img => img.id.startsWith('banner-'));

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
          {banners.map(banner => (
            <CarouselItem key={banner.id}>
              <Card className="overflow-hidden">
                <CardContent className="relative aspect-[3/1] p-0">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.description}
                    fill
                    className="object-cover"
                    data-ai-hint={banner.imageHint}
                    priority={banner.id === 'banner-1'}
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
}
