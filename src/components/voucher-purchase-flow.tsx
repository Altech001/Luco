
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Smartphone, LoaderCircle, TicketIcon, CheckCircle, UserCircle, Wallet, Send, Home, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Voucher } from '@/types';
import { Badge } from './ui/badge';
import { updateVoucher } from '@/lib/vouchers';
import { Timestamp } from 'firebase/firestore';
import { verifyIdentity, requestPayment, checkPaymentStatus } from '@/lib/payment';


type PurchaseStep = 'enter-phone' | 'confirm-identity' | 'verify-payment' | 'receipt' | 'failed';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number.'),
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
  const [identityName, setIdentityName] = useState('');
  const [reference, setReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const { toast } = useToast();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });
  
  useEffect(() => {
    if (voucher.category === 'Promo' && voucher.price === 0) {
      setStep('receipt');
    }
  }, [voucher]);
  
  const isVoucherUnavailable = voucher.status === 'purchased' || voucher.status === 'expired';

  const formatPhoneNumber = (input: string): string => {
    const digitsOnly = input.replace(/\D/g, '');

    if (digitsOnly.startsWith('07') && (digitsOnly.length === 10)) {
        return `+256${digitsOnly.substring(1)}`;
    }
    if (digitsOnly.startsWith('7') && (digitsOnly.length === 9)) {
        return `+256${digitsOnly}`;
    }
    if (digitsOnly.startsWith('256') && (digitsOnly.length === 12)) {
        return `+${digitsOnly}`;
    }
    if (digitsOnly.length === 9) {
        return `+256${digitsOnly}`;
    }
    return input.startsWith('+') ? input : `+${input}`;
  };

  const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(values.phone);
    setPhoneNumber(formattedPhone);

    try {
      const result = await verifyIdentity(formattedPhone);
      if (result.success && result.identityName) {
        setIdentityName(result.identityName);
        setStep('confirm-identity');
        toast({ title: 'Identity Verified', description: `Welcome, ${result.identityName}!` });
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: result.error });
      }
    } catch (error: any) {
      console.error('Identity check failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while verifying your number.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentRequest = async () => {
    setIsLoading(true);
    try {
      const result = await requestPayment(phoneNumber, voucher.price);
      if (result.success && result.transactionId) {
        setReference(result.transactionId);
        setStep('verify-payment');
        toast({ title: 'Payment Initiated', description: 'Please wait while we confirm payment...' });
        pollPaymentStatus(result.transactionId);
      } else {
        toast({ variant: 'destructive', title: 'Payment Failed', description: result.error });
        setStep('failed');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Could not connect to the payment service.' });
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = (ref: string) => {
    const intervalId = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(ref);
        if(result.success && result.data) {
            const status = result.data.status?.toLowerCase();
            if (status === 'succeeded' || status === 'success') {
              clearInterval(intervalId);
              setPaymentStatus('succeeded');
              await updateVoucher(voucher.id, { 
                status: 'purchased', 
                purchasedBy: phoneNumber,
                purchasedAt: Timestamp.now() 
              });
              setStep('receipt');
              toast({ title: 'Payment Successful!', className: 'bg-green-500 text-white' });
            } else if (status === 'failed') {
              clearInterval(intervalId);
              setPaymentStatus('failed');
              setStep('failed');
              toast({ variant: 'destructive', title: 'Payment Failed', description: result.data.reason || 'The transaction was not successful.' });
            }
        } else if (!result.success && result.error !== 'Transaction not found. Please check your reference.') {
            clearInterval(intervalId);
            setPaymentStatus('error');
            setStep('failed');
            toast({ variant: 'destructive', title: 'Status Check Error', description: result.error });
        }
      } catch (err) {
        clearInterval(intervalId);
        setPaymentStatus('error');
        setStep('failed');
        toast({ variant: 'destructive', title: 'Status Check Error', description: 'Could not retrieve payment status.' });
      }
    }, 2000);
  };
  
  const handleSendSms = () => {
    if (!phoneNumber) {
        toast({
            variant: 'destructive',
            title: 'Phone Number Missing',
            description: "We don't have a phone number to send the SMS to."
        });
        return;
    }
    toast({
        title: "SMS Sent!",
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
             {isVoucherUnavailable && (
                <div className="my-4 flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    <ShieldX className="h-6 w-6" />
                    <div>
                        <h3 className="font-semibold">Voucher Unavailable</h3>
                        <p className="text-sm">This voucher has already been {voucher.status}.</p>
                    </div>
                </div>
             )}
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
                          <Input placeholder="+256 7..." {...field} className="pl-10" disabled={isVoucherUnavailable} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isVoucherUnavailable}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Verify My Number'}
                </Button>
              </form>
            </Form>
          </MotionDiv>
        );

      case 'confirm-identity':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
             <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                <h2 className="text-lg font-semibold leading-none tracking-tight">Confirm & Pay</h2>
                <p className="text-sm text-muted-foreground">
                    Please confirm your identity to complete the purchase.
                </p>
            </div>
            <div className="my-6 space-y-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-3">
                        <UserCircle className="h-6 w-6 text-muted-foreground"/>
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-semibold">{identityName}</p>
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
                <Button onClick={handlePaymentRequest} className="w-full" disabled={isLoading}>
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
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <h3 className="font-semibold">Processing Payment...</h3>
                <p className="text-sm text-muted-foreground">Please approve the transaction on your phone. We are waiting for confirmation.</p>
                <p className="text-xs text-muted-foreground/80 pt-2">Ref: {reference}</p>
            </div>
          </MotionDiv>
        );

      case 'receipt':
        const isFreePromo = voucher.category === 'Promo' && voucher.price === 0;
        return (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {isFreePromo ? "Your Promotional Voucher" : "Purchase Complete!"}
              </h2>
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
                        <TicketIcon className="h-10 w-10 text-[hsl(var(--highlight))]"/>
                        <p className="mt-2 text-xl font-bold text-[hsl(var(--highlight))]">{voucher.discount}</p>
                      </div>
                    </div>
                  </div>
            </div>
            <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleSendSms} disabled={isFreePromo}>
                    <Send className="mr-2"/> Send via SMS
                </Button>
                <Button variant="outline" className="w-full" onClick={onComplete}>
                    <Home className="mr-2"/> Done
                </Button>
            </div>
          </MotionDiv>
        );

      case 'failed':
         return (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-4 text-center">
                <ShieldX className="h-12 w-12 text-destructive" />
                <h3 className="font-semibold text-lg">Payment Failed</h3>
                <Badge variant="destructive">Status: {paymentStatus || 'failed'}</Badge>
                <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
                <Button onClick={() => setStep('enter-phone')} className="mt-4 w-full">Try Again</Button>
            </MotionDiv>
        )

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
