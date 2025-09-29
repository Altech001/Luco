
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVoucherById } from '@/lib/vouchers';
import type { Voucher } from '@/types';
import VoucherPurchaseFlow from '@/components/voucher-purchase-flow';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TicketPercent, LoaderCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PurchasePage() {
  const router = useRouter();
  const params = useParams();
  const voucherId = params.voucherId as string;
  const [voucher, setVoucher] = useState<Voucher | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (voucherId) {
      const fetchVoucher = async () => {
        setIsLoading(true);
        const fetchedVoucher = await getVoucherById(voucherId);
        setVoucher(fetchedVoucher);
        setIsLoading(false);
      };
      fetchVoucher();
    }
  }, [voucherId]);
  
  const NotFound = () => (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold">Voucher not found</h1>
        <p className="text-muted-foreground">The voucher you are trying to purchase does not exist.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go back to Home</Button>
      </div>
  );

  if (isLoading) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
       </div>
    )
  }

  if (!voucher) {
    return <NotFound />;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go Back</span>
            </Button>
             <div className="flex items-center gap-2 sm:gap-3">
                <TicketPercent className="h-7 w-7 text-[hsl(var(--highlight))]" />
                <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
                    Luco
                </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto max-w-sm px-4 py-8 sm:px-6 lg:px-8">
        <VoucherPurchaseFlow voucher={voucher} onComplete={() => router.push('/')} />
      </main>
    </>
  );
}
