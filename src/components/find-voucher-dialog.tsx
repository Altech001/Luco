
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Smartphone, Search, LoaderCircle, TicketIcon, XCircle, Send, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getVouchersByPhone } from '@/lib/vouchers';
import type { Voucher } from '@/types';
import { Badge } from './ui/badge';
import VoucherCard from './voucher-card';

type SearchStep = 'enter-phone' | 'show-results';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

const MotionDiv = motion.div;

export default function FindVoucherDialog({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<SearchStep>('enter-phone');
  const [isLoading, setIsLoading] = useState(false);
  const [foundVouchers, setFoundVouchers] = useState<Voucher[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    setPhoneNumber(values.phone);
    try {
      const vouchers = await getVouchersByPhone(values.phone);
      setFoundVouchers(vouchers);
      setStep('show-results');
      if (vouchers.length === 0) {
         toast({
            variant: 'destructive',
            title: 'No Vouchers Found',
            description: "We couldn't find any purchased vouchers for that phone number.",
        });
      } else {
        toast({
            title: 'Vouchers Found!',
            description: `We found ${vouchers.length} purchased voucher(s).`
        });
      }
    } catch (error) {
      console.error("Error finding vouchers:", error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'An error occurred while searching for your vouchers.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendSms = (code: string) => {
    toast({
        title: "SMS Sent!",
        description: `Voucher code ${code} has been sent to ${phoneNumber}.`
    });
  }

  const renderStep = () => {
    switch (step) {
      case 'enter-phone':
        return (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogHeader>
              <DialogTitle>Find Your Voucher</DialogTitle>
              <DialogDescription>Enter the phone number you used during purchase to find your voucher code.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePhoneSubmit)} className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+1234567890" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <Search className="mr-2" />}
                    Find Voucher
                </Button>
              </form>
            </Form>
          </MotionDiv>
        );

      case 'show-results':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <DialogHeader>
              <DialogTitle>Your Purchased Vouchers</DialogTitle>
              <DialogDescription>Here are the vouchers we found for {phoneNumber}.</DialogDescription>
            </DialogHeader>
            <div className="py-6 max-h-[400px] overflow-y-auto space-y-4">
              {foundVouchers.length > 0 ? (
                foundVouchers.map(voucher => (
                    <div key={voucher.id} className="relative flex min-h-[120px] w-full rounded-lg border bg-card text-card-foreground shadow-md">
                        <div className="relative w-2/3 p-4">
                            <div className="absolute top-1/2 -right-[13px] z-10 -translate-y-1/2 h-6 w-6 rounded-full bg-background dark:bg-card"></div>
                            <div className="flex h-full flex-col justify-between space-y-2">
                                <div>
                                    <Badge variant="secondary" className="mb-1">{voucher.category}</Badge>
                                    <p className="text-sm font-semibold leading-tight text-card-foreground">{voucher.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase text-muted-foreground">Voucher Code</p>
                                    <p className="font-mono text-base font-semibold tracking-wider">{voucher.code}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-1/3 rounded-r-lg border-l-2 border-dashed bg-accent/30 dark:bg-accent/10 p-2">
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <TicketIcon className="h-8 w-8 text-[hsl(var(--highlight))]"/>
                                <p className="mt-1 text-lg font-bold text-[hsl(var(--highlight))]">{voucher.discount}</p>
                                <Button size="sm" variant="ghost" className="mt-2 h-auto px-2 py-1 text-xs" onClick={() => handleSendSms(voucher.code)}>
                                    <Send className="mr-1 h-3 w-3" /> Resend
                                </Button>
                            </div>
                        </div>
                    </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-10 text-center">
                    <XCircle className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No Vouchers Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        No active purchased vouchers were found for this number.
                    </p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" onClick={() => setStep('enter-phone')}>Search Again</Button>
                <Button className="w-full" onClick={onComplete}>
                    <Home className="mr-2"/> Done
                </Button>
            </div>
          </MotionDiv>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-2">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
