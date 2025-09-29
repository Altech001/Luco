
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Sun, Moon, Laptop, Mail, Bell, Send, Users, ChevronsUpDown, Smartphone, UserCircle, Wallet, CheckCircle, Search, RefreshCw, XCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getSubscribers, sendSms } from '@/lib/subscribers';
import type { Subscriber } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { verifyIdentity, requestPayment, checkPaymentStatus } from '@/lib/payment';


const phoneSchema = z.object({
  phone: z.string().min(10, 'A valid phone number is required.'),
});
type PhoneFormValues = z.infer<typeof phoneSchema>;

const amountSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0.'),
  reference: z.string().optional(),
});
type AmountFormValues = z.infer<typeof amountSchema>;

type PaymentStep = 'idle' | 'amount' | 'status' | 'completed' | 'failed';

const PaymentFlow = () => {
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

  const handleIdentityCheck = async (values: PhoneFormValues) => {
    setIsLoading(true);
    setPhone(values.phone);
    try {
      const result = await verifyIdentity(values.phone);
      if (result.success && result.identityName) {
        setIdentityName(result.identityName);
        setStep('amount');
        toast({ title: 'Identity Verified', description: `Welcome, ${result.identityName}!` });
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: result.error });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Could not connect to the identity service.' });
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
              setStep('completed');
              toast({ title: 'Payment Successful!', className: 'bg-green-500 text-white' });
            } else if (status === 'failed') {
              clearInterval(intervalId);
              setPaymentStatus('failed');
              setStep('failed');
              toast({ variant: 'destructive', title: 'Payment Failed', description: result.data.reason || 'The transaction was not successful.' });
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
        toast({ variant: 'destructive', title: 'Status Check Error', description: 'Could not retrieve payment status.' });
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
  }

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
                <p className="text-sm text-muted-foreground">Please wait while we confirm your transaction. Do not close this window.</p>
                <p className="text-xs text-muted-foreground/80 pt-2">Ref: {reference}</p>
            </div>
        )
      case 'completed':
         return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="font-semibold text-lg">Payment Successful</h3>
                <Badge variant="secondary">Status: {paymentStatus}</Badge>
                <p className="text-sm text-muted-foreground">The transaction was completed successfully.</p>
                <Button onClick={resetFlow} className="mt-4 w-full">Start New Payment</Button>
            </div>
        )
      case 'failed':
         return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <XCircle className="h-12 w-12 text-destructive" />
                <h3 className="font-semibold text-lg">Payment Failed</h3>
                <Badge variant="destructive">Status: {paymentStatus || 'failed'}</Badge>
                <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
                <Button onClick={resetFlow} className="mt-4 w-full">Try Again</Button>
            </div>
        )
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Payment Flow</CardTitle>
        <CardDescription>
          Step through the payment process using the LucoPay API.
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
};


export default function SettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isRecipientsOpen, setIsRecipientsOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);

  const smsForm = useForm<{ message: string }>({
    resolver: zodResolver(z.object({ message: z.string().min(1, 'Message cannot be empty.') })),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (isSmsDialogOpen) {
      const fetchSubscribers = async () => {
        try {
          const subs = await getSubscribers();
          setSubscribers(subs);
        } catch (error) {
          console.error("Failed to fetch subscribers:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch subscriber list.' });
        }
      };
      fetchSubscribers();
    }
  }, [isSmsDialogOpen, toast]);
  
  const handleSmsToggle = (checked: boolean) => {
    setIsSmsEnabled(checked);
    if (checked) {
      setIsSmsDialogOpen(true);
    }
  }

  const handleSendSms = async (values: { message: string }) => {
    setIsSubmitting(true);
    try {
      await sendSms(subscribers.map(s => s.phone), values.message);
      toast({
        title: 'Bulk SMS Sent!',
        description: `Your message has been sent to ${subscribers.length} subscribers.`,
      });
      smsForm.reset();
      setIsSmsDialogOpen(false);
      setIsSmsEnabled(false);
    } catch (error) {
      console.error("Failed to send bulk SMS:", error);
      toast({ variant: 'destructive', title: 'Send Failed', description: 'There was an error sending the bulk SMS.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <PaymentFlow />
        <Card>
            <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                    Choose how you want the application to look.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" /> Light
                    </Button>
                     <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" /> Dark
                    </Button>
                     <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>
                        <Laptop className="mr-2 h-4 w-4" /> System
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                    Configure how you receive alerts from the system.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">Receive alerts about important events via email.</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="email-notifications" />
                    </div>
                </div>
                 <div className="flex items-start justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                        <h3 className="font-medium">SMS Notifications</h3>
                        <p className="text-sm text-muted-foreground">Send bulk SMS messages to all subscribers.</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch 
                          id="sms-notifications"
                          checked={isSmsEnabled}
                          onCheckedChange={handleSmsToggle}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

       <Dialog open={isSmsDialogOpen} onOpenChange={(open) => {
         setIsSmsDialogOpen(open);
         if (!open) {
           setIsSmsEnabled(false);
           smsForm.reset();
         }
       }}>
        <DialogContent className="max-w-md w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Send Bulk SMS</DialogTitle>
            <DialogDescription>
              Compose a message to send to all your subscribers.
            </DialogDescription>
          </DialogHeader>
            <Form {...smsForm}>
              <form id="sms-form" onSubmit={smsForm.handleSubmit(handleSendSms)} className="space-y-4 pt-2">
                 <Collapsible
                    open={isRecipientsOpen}
                    onOpenChange={setIsRecipientsOpen}
                    className="w-full space-y-2"
                    >
                     <div className="flex items-center justify-between space-x-4 px-1">
                        <h4 className="text-sm font-semibold">
                            Recipients ({subscribers.length})
                        </h4>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                                <ChevronsUpDown className="h-4 w-4" />
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <ScrollArea className="h-40 w-full rounded-md border">
                            <div className="p-4 text-sm">
                                {subscribers.length > 0 ? (
                                <ul className="space-y-2">
                                    {subscribers.map(sub => (
                                    <li key={sub.id} className="text-muted-foreground">{sub.phone}</li>
                                    ))}
                                </ul>
                                ) : (
                                <p className="text-muted-foreground text-center py-4">No subscribers found.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CollapsibleContent>
                    </Collapsible>

                  <FormField
                  control={smsForm.control}
                  name="message"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                          <Textarea
                              placeholder="Type your promotional message here..."
                              className="resize-none"
                              rows={5}
                              {...field}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              </form>
            </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" form="sms-form" disabled={isSubmitting || subscribers.length === 0}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send to {subscribers.length} Subscribers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
