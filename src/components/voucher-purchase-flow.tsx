
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Smartphone, KeyRound, LoaderCircle, TicketIcon, Bot, CheckCircle, UserCircle, Wallet, Send, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Voucher } from '@/types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type PurchaseStep = 'enter-phone' | 'confirm-identity' | 'verify-payment' | 'receipt';

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

type IdentityResponse = {
  identityname: string;
  message: string;
  success: boolean;
};

const MotionDiv = motion.div;

export default function VoucherPurchaseFlow({ voucher, onComplete }: VoucherPurchaseFlowProps) {
  const [step, setStep] = useState<PurchaseStep>('enter-phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [identity, setIdentity] = useState<IdentityResponse | null>(null);
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
    try {
      const response = await fetch('https://lucopay.onrender.com/identity/msisdn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ msisdn: values.phone }),
      });
      const data: IdentityResponse = await response.json();
      if (data.success) {
        setIdentity(data);
        setStep('confirm-identity');
      } else {
        toast({
          variant: 'destructive',
          title: 'Identity Check Failed',
          description: data.message || 'Could not verify the phone number.',
        });
      }
    } catch (error) {
      console.error('Identity check failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while verifying your number.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdentityConfirm = async () => {
    // This would be where you trigger the payment.
    // For now, we simulate sending an OTP for verification.
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setIsLoading(false);
    setStep('verify-payment');
    toast({
      title: 'Verification Code Sent!',
      description: `A code has been sent to ${phoneNumber}.`,
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

  const handleSendSms = () => {
    // In a real app, you'd call an SMS service here.
    toast({
        title: 'SMS Sent!',
        description: `Your voucher code has been sent to ${phoneNumber}.`
    });
  }
  
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
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Confirm Purchase</h2>
              <p className="text-sm text-muted-foreground">Enter your phone number to purchase the "{voucher.title}" voucher for {formattedPrice}.</p>
            </div>
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

      case 'confirm-identity':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
             <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                <h2 className="text-lg font-semibold leading-none tracking-tight">Confirm Identity & Pay</h2>
                <p className="text-sm text-muted-foreground">
                    Please confirm that you want to complete this purchase.
                </p>
            </div>
            <div className="my-6 space-y-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-3">
                        <UserCircle className="h-6 w-6 text-muted-foreground"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-semibold">{identity?.identityname}</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-3">
                        <Wallet className="h-6 w-6 text-muted-foreground"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Amount to Pay</p>
                            <p className="font-semibold">{formattedPrice}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <Button onClick={handleIdentityConfirm} className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <CheckCircle className="mr-2" />}
                    Confirm & Pay
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep('enter-phone')}>Back</Button>
            </div>
          </MotionDiv>
        );

      case 'verify-payment':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Verify Your Payment</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to <span className="font-semibold text-foreground">{phoneNumber}</span> to complete the payment.
              </p>
            </div>
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
                <Button variant="link" size="sm" onClick={() => setStep('confirm-identity')}>Back</Button>
              </form>
            </Form>
          </MotionDiv>
        );

      case 'receipt':
        return (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Purchase Complete!</h2>
              <p className="text-sm text-muted-foreground">Here is your voucher. Present this code at the store.</p>
            </div>
            <div className="py-6">
                <div className="relative flex min-h-[160px] w-full rounded-lg border bg-card text-card-foreground shadow-md">
                    <div className="relative w-2/3 p-4">
                        <div className="absolute top-1/2 -right-[13px] z-10 -translate-y-1/2 h-6 w-6 rounded-full bg-background dark:bg-card"></div>
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
                        <TicketIcon className="h-10 w-10 text-[hsl(var(--highlight))]" />
                        <p className="mt-2 text-xl font-bold text-[hsl(var(--highlight))]">{voucher.discount}</p>
                      </div>
                    </div>
                  </div>
            </div>
            <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleSendSms}>
                    <Send className="mr-2"/> Send via SMS
                </Button>
                <Button variant="outline" className="w-full" onClick={onComplete}>
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
