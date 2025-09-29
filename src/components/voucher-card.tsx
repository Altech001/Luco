'use client';
import { Copy, TicketCheck, CalendarClock } from 'lucide-react';
import type { Voucher } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type VoucherCardProps = {
  voucher: Voucher;
  isHighlighted?: boolean;
};

export default function VoucherCard({ voucher, isHighlighted = false }: VoucherCardProps) {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    toast({
      title: 'Code Copied!',
      description: `${voucher.code} is now in your clipboard.`,
    });
  };

  return (
    <Card
      className={cn(
        'group w-full transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        isHighlighted && 'shadow-lg ring-2 ring-offset-2 ring-[hsl(var(--highlight))]'
      )}
    >
      <div className="relative flex min-h-[140px]">
        {voucher.isNew && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 z-10 animate-pulse bg-[hsl(var(--highlight))] text-[hsl(var(--highlight-foreground))]"
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
              <h3 className="font-headline text-base sm:text-lg font-semibold leading-tight">{voucher.title}</h3>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{voucher.description}</p>
            </div>
            <div className="mt-2 sm:mt-4 flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Expires: {voucher.expiryDate}</span>
            </div>
          </CardContent>
        </div>
        <div className="relative w-1/3 rounded-r-md border-l-2 border-dashed bg-accent/50 p-2 sm:p-4">
          <div className="absolute top-1/2 -left-[1px] -translate-y-1/2 h-6 w-6 rounded-full bg-background sm:top-1/2"></div>
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-xl sm:text-2xl font-bold text-[hsl(var(--highlight))]">{voucher.discount}</p>
            <p className="text-[10px] sm:text-xs font-semibold uppercase text-accent-foreground">Discount</p>
            <div className="mt-1 sm:mt-2 space-y-1">
              <p className="text-[10px] sm:text-xs font-semibold tracking-wider text-primary">{voucher.code}</p>
               <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0" onClick={handleCopyCode}>
                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
