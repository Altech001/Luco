'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  LoaderCircle,
  Search,
  CheckCircle,
  XCircle,
  Smartphone,
  UserCircle,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { verifyIdentity, requestPayment, checkPaymentStatus } from '@/lib/payment';

const phoneSchema = z.object({
  phone: z.string().min(1, 'A valid phone number is required.'),
});
type PhoneFormValues = z.infer<typeof phoneSchema>;

const amountSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0.'),
  reference: z.string().optional(),
});
type AmountFormValues = z.infer<typeof amountSchema>;

type PaymentStep = 'idle' | 'amount' | 'status' | 'completed' | 'failed';

export default function PaymentFlow() {
  const { toast } = useToast();
  const [step, setStep] = useState<PaymentStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [identityName, setIdentityName] = useState('');
  const [reference, setReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const amountForm = useForm<AmountFormValues>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: 100, reference: '' },
  });

  const formatPhoneNumber = (input: string): string => {
    const digitsOnly = input.replace(/\D/g, '');

    if (digitsOnly.startsWith('07') && digitsOnly.length === 10) {
      return `+256${digitsOnly.substring(1)}`;
    }
    if (digitsOnly.startsWith('7') && digitsOnly.length === 9) {
      return `+256${digitsOnly}`;
    }
    if (digitsOnly.startsWith('256') && digitsOnly.length === 12) {
      return `+${digitsOnly}`;
    }
    if (digitsOnly.length === 9) {
      // Assumes it's a number like 7...
      return `+256${digitsOnly}`;
    }

    // Return original input if no specific format matches, prepending with + if needed
    return input.startsWith('+') ? input : `+${input}`;
  };

  const handleIdentityCheck = async (values: PhoneFormValues) => {
    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(values.phone);
    setPhone(formattedPhone);

    try {
      const result = await verifyIdentity(formattedPhone);
      if (result.success && result.identityName) {
        setIdentityName(result.identityName);
        setStep('amount');
        toast({ title: 'Identity Verified', description: `Welcome, ${result.identityName}!` });
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: result.error });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Could not connect to the identity service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentRequest = async (values: AmountFormValues) => {
    setIsLoading(true);
    try {
      const result = await requestPayment(phone, values.amount, values.reference);
      if (result.success && result.transactionId) {
        setReference(result.transactionId);
        setStep('status');
        toast({ title: 'Payment Initiated', description: 'Checking transaction status...' });
        pollPaymentStatus(result.transactionId);
      } else {
        toast({ variant: 'destructive', title: 'Payment Failed', description: result.error });
        setStep('failed');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Could not connect to the payment service.',
      });
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = (ref: string) => {
    const intervalId = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(ref);

        if (result.success && result.data) {
          const status = result.data.status?.toLowerCase();
          if (status === 'succeeded' || status === 'success') {
            clearInterval(intervalId);
            setPaymentStatus('succeeded');
            setStep('completed');
            toast({ title: 'Payment Successful!', className: 'bg-green-500 text-white' });
          } else if (status === 'failed') {
            clearInterval(intervalId);
            setPaymentStatus('failed');
            setStep('failed');
            toast({
              variant: 'destructive',
              title: 'Payment Failed',
              description: result.data.reason || 'The transaction was not successful.',
            });
          }
        } else if (!result.success && result.error !== 'Transaction not found. Please check your reference.') {
          // Stop polling on definitive errors other than "not found"
          clearInterval(intervalId);
          setPaymentStatus('error');
          setStep('failed');
          toast({ variant: 'destructive', title: 'Status Check Error', description: result.error });
        }
        // If status is 'pending' or 'not found', the interval continues to run
      } catch (err) {
        clearInterval(intervalId);
        setPaymentStatus('error');
        setStep('failed');
        toast({
          variant: 'destructive',
          title: 'Status Check Error',
          description: 'Could not retrieve payment status.',
        });
      }
    }, 2000); // Check every 2 seconds
  };

  const resetFlow = () => {
    setStep('idle');
    setPhone('');
    setIdentityName('');
    setReference('');
    setPaymentStatus('');
    phoneForm.reset();
    amountForm.reset({ amount: 100, reference: '' });
  };

  const renderContent = () => {
    switch (step) {
      case 'idle':
        return (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handleIdentityCheck)} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="+256..." {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <LoaderCircle className="animate-spin" /> : <Search className="mr-2" />}
                Verify Identity
              </Button>
            </form>
          </Form>
        );
      case 'amount':
        return (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Enter Amount</h2>
              <p className="text-muted-foreground">Complete the payment for the verified user.</p>
            </div>
            <Form {...amountForm}>
              <form onSubmit={amountForm.handleSubmit(handlePaymentRequest)} className="space-y-4">
                <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/30">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">{identityName}</p>
                    <p className="text-xs text-muted-foreground">{phone}</p>
                  </div>
                </div>
                <FormField
                  control={amountForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={amountForm.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated if empty" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2 pt-2">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <LoaderCircle className="animate-spin" /> : 'Proceed to Pay'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep('idle')} className="w-full">
                    Back
                  </Button>
                </div>
              </form>
            </Form>
          </>
        );
      case 'status':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <h3 className="font-semibold">Processing Payment...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your transaction. Do not close this window.
            </p>
            <p className="text-xs text-muted-foreground/80 pt-2">Ref: {reference}</p>
          </div>
        );
      case 'completed':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h3 className="font-semibold text-lg">Payment Successful</h3>
            <Badge variant="secondary">Status: {paymentStatus}</Badge>
            <p className="text-sm text-muted-foreground">The transaction was completed successfully.</p>
            <Button onClick={resetFlow} className="mt-4 w-full">
              Start New Payment
            </Button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <h3 className="font-semibold text-lg">Payment Failed</h3>
            <Badge variant="destructive">Status: {paymentStatus || 'failed'}</Badge>
            <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
            <Button onClick={resetFlow} className="mt-4 w-full">
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Amount</CardTitle>
        <CardDescription>
          Use this form to deposit funds using the LucoPay API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
