
'use client';

import { useState } from 'react';
import { Sparkles, LoaderCircle, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import MembershipAuth from './membership-auth';
import FindVoucherDialog from './find-voucher-dialog';

type PersonalizedVouchersProps = {
  onRecommendations: (ids: string[]) => void;
};

export default function PersonalizedVouchers({ onRecommendations }: PersonalizedVouchersProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFindVoucherOpen, setIsFindVoucherOpen] = useState(false);

  return (
    <Card className="bg-gradient-to-br from-accent/40 to-background">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl sm:text-3xl">
          <Sparkles className="h-6 w-6 text-[hsl(var(--highlight))]" />
          <span>For You</span>
        </CardTitle>
        <CardDescription>
          Find your purchased voucher or join our exclusive member program for more benefits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Dialog open={isFindVoucherOpen} onOpenChange={setIsFindVoucherOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Find My Voucher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px] w-[90vw] rounded-lg">
                <FindVoucherDialog onComplete={() => setIsFindVoucherOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Star className="mr-2 h-4 w-4" />
                Become a Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px] w-[90vw] rounded-lg">
              <MembershipAuth onComplete={() => setIsAuthOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
