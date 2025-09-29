
'use client';
import { CalendarClock, ShoppingCart } from 'lucide-react';
import type { Voucher } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VoucherPurchaseFlow from './voucher-purchase-flow';
import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type VoucherCardProps = {
  voucher: Voucher;
  isHighlighted?: boolean;
};

export default function VoucherCard({ voucher, isHighlighted = false }: VoucherCardProps) {
  const [isPurchaseFlowOpen, setIsPurchaseFlowOpen] = useState(false);
  const { toast } = useToast();

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(voucher.price);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // prevent card's onClick from firing
    setIsPurchaseFlowOpen(true);
  };

  return (
    <Dialog open={isPurchaseFlowOpen} onOpenChange={setIsPurchaseFlowOpen}>
      <Card
        onClick={() => setIsPurchaseFlowOpen(true)}
        className={cn(
          'group w-full transform-gpu cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
          isHighlighted && 'shadow-lg ring-2 ring-offset-2 ring-[hsl(var(--highlight))]'
        )}
      >
        <div className="relative flex min-h-[180px] sm:min-h-[160px] text-card-foreground">
          {voucher.isNew && (
            <Badge
              className="absolute -right-2 -top-2 z-10 animate-pulse bg-[hsl(var(--highlight))] text-[hsl(var(--highlight-foreground))] border-transparent"
            >
              New!
            </Badge>
          )}
          <div className="w-2/3 p-3 sm:p-4">
            <CardContent className="flex h-full flex-col justify-between p-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{voucher.category}</Badge>
                </div>
                <h3 className="font-headline text-sm sm:text-base font-semibold leading-tight text-card-foreground">{voucher.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{voucher.description}</p>
              </div>
              <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs text-muted-foreground">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>Expires: {voucher.expiryDate}</span>
                </div>
                 <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs"
                    onClick={handleButtonClick}
                  >
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    Buy Now
                </Button>
              </div>
            </CardContent>
          </div>
          <div className="relative w-1/3 rounded-r-lg border-l-2 border-dashed bg-accent/30 dark:bg-accent/10 p-2 sm:p-4">
            <div className="absolute top-1/2 -left-[13px] -translate-y-1/2 h-6 w-6 rounded-full bg-background dark:bg-card"></div>
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-sm font-bold text-foreground/90">{formattedPrice}</p>
              <p className="text-xl sm:text-2xl font-bold text-[hsl(var(--highlight))]">{voucher.discount}</p>
              <p className="text-[10px] sm:text-xs font-semibold uppercase text-accent-foreground/80">Discount</p>
            </div>
          </div>
        </div>
      </Card>
      <DialogContent className="max-w-[400px] w-[90vw] rounded-lg">
        <VoucherPurchaseFlow voucher={voucher} onComplete={() => setIsPurchaseFlowOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
