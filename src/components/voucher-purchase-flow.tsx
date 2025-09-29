
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Smartphone, KeyRound, LoaderCircle, TicketIcon, Bot, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Voucher } from '@/types';
import { Badge } from './ui/badge';

type PurchaseStep = 'enter-phone' | 'verify-phone' | 'receipt';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits.'),
});

type VoucherPurchaseFlowProps = {
  voucher: Voucher;
  onComplete: () => void;
};

const MotionDiv = motion.div;

export default function VoucherPurchaseFlow({ voucher, onComplete }: VoucherPurchaseFlowProps) {
  const [step, setStep] = useState<PurchaseStep>('enter-phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    setPhoneNumber(values.phone);
    await new Promise(res => setTimeout(res, 1000)); // Simulate sending OTP
    setIsLoading(false);
    setStep('verify-phone');
    toast({
      title: 'Verification Code Sent!',
      description: `A code has been sent to ${values.phone}.`,
    });
  };

  const handleVerificationSubmit = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate verification
    if (values.code === '123456') { // Mock OTP
      setIsLoading(false);
      setStep('receipt');
      toast({
        title: 'Purchase Successful!',
        description: 'Your voucher is ready.',
      });
    } else {
      setIsLoading(false);
      codeForm.setError('code', { type: 'manual', message: 'Invalid verification code.' });
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'The code you entered is incorrect.',
      });
    }
  };
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(voucher.price);


  const renderStep = () => {
    switch (step) {
      case 'enter-phone':
        return (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>Enter your phone number to purchase the "{voucher.title}" voucher for {formattedPrice}.</DialogDescription>
            </DialogHeader>
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6 pt-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+256 7..." {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <KeyRound className="mr-2" />}
                    Proceed to Verify
                </Button>
              </form>
            </Form>
          </MotionDiv>
        );

      case 'verify-phone':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <DialogHeader>
              <DialogTitle>Verify Your Number</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code sent to <span className="font-semibold text-foreground">{phoneNumber}</span>.
              </DialogDescription>
            </DialogHeader>
            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(handleVerificationSubmit)} className="space-y-6 pt-4">
                 <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="123456" {...field} className="pl-10 tracking-[0.5em] text-center" maxLength={6} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <CheckCircle className="mr-2" />}
                    Verify & Purchase
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep('enter-phone')}>Back</Button>
              </form>
            </Form>
          </MotionDiv>
        );

      case 'receipt':
        return (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogHeader>
              <DialogTitle>Purchase Complete!</DialogTitle>
              <DialogDescription>Here is your voucher. Present this code at the store.</DialogDescription>
            </DialogHeader>
            <div className="py-6">
                <div className="relative flex min-h-[160px] w-full rounded-lg border bg-card text-card-foreground shadow-md">
                    <div className="relative w-2/3 p-4">
                        <div className="absolute top-1/2 -right-[13px] z-10 -translate-y-1/2 h-6 w-6 rounded-full bg-background dark:bg-card-foreground"></div>
                         <div className="flex h-full flex-col justify-between space-y-4">
                            <div>
                                <Badge variant="secondary" className="mb-2">{voucher.category}</Badge>
                                <p className="text-base font-semibold leading-tight text-card-foreground">{voucher.title}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-muted-foreground">Voucher Code</p>
                                <p className="font-mono text-lg font-semibold tracking-wider">{voucher.code}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative w-1/3 rounded-r-lg border-l-2 border-dashed bg-accent/30 dark:bg-accent/10 p-2">
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <TicketIcon className="h-10 w-10 text-highlight" />
                        <p className="mt-2 text-xl font-bold text-[hsl(var(--highlight))]">{voucher.discount}</p>
                      </div>
                    </div>
                  </div>
            </div>
            <Button className="w-full" onClick={onComplete}>
                Done
            </Button>
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
