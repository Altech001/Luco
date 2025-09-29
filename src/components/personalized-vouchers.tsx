'use client';

import { useState } from 'react';
import { Sparkles, LoaderCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedVoucherRecommendations } from '@/ai/flows/personalized-voucher-recommendations';
import { purchaseHistory, voucherCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import MembershipAuth from './membership-auth';

type PersonalizedVouchersProps = {
  onRecommendations: (ids: string[]) => void;
};

export default function PersonalizedVouchers({ onRecommendations }: PersonalizedVouchersProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await getPersonalizedVoucherRecommendations({
        purchaseHistory,
        voucherCategories,
      });
      onRecommendations(result.recommendedVouchers);
      toast({
        title: 'Recommendations Ready!',
        description: 'We found some vouchers just for you.',
      });
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate recommendations at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-accent/40 to-background">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl sm:text-3xl">
          <Sparkles className="h-6 w-6 text-[hsl(var(--highlight))]" />
          <span>For You</span>
        </CardTitle>
        <CardDescription>
          Get voucher recommendations based on your purchase history or join our member program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Get My Recommendations'}
          </Button>
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
