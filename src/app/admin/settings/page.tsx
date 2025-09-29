
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
import { LoaderCircle, Wallet, Sun, Moon, Laptop, Mail, Bell, Send, Users, ChevronsUpDown } from 'lucide-react';
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

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Please enter an amount.'),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;

const bulkSmsSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});
type BulkSmsFormValues = z.infer<typeof bulkSmsSchema>;


export default function SettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isRecipientsOpen, setIsRecipientsOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const smsForm = useForm<BulkSmsFormValues>({
    resolver: zodResolver(bulkSmsSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (isSmsDialogOpen) {
      const fetchSubscribers = async () => {
        try {
          const subs = await getSubscribers();
          setSubscribers(subs);
        } catch (error) {
          console.error("Failed to fetch subscribers:", error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch subscriber list.',
          });
        }
      };
      fetchSubscribers();
    }
  }, [isSmsDialogOpen, toast]);

  const handlePaymentSubmit = (values: PaymentFormValues) => {
    setIsSubmitting(true);
    console.log('Payment submitted:', values);
    setTimeout(() => {
      toast({
        title: 'Payment Processed',
        description: `Amount of ${values.amount} has been processed.`,
      });
      paymentForm.reset();
      setIsSubmitting(false);
    }, 1000);
  };
  
  const handleSmsToggle = (checked: boolean) => {
    setIsSmsEnabled(checked);
    if (checked) {
      setIsSmsDialogOpen(true);
    }
  }

  const handleSendSms = async (values: BulkSmsFormValues) => {
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
      toast({
        variant: 'destructive',
        title: 'Send Failed',
        description: 'There was an error sending the bulk SMS.',
      });
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
        <Card>
            <CardHeader>
                <CardTitle>Add Payment</CardTitle>
                <CardDescription>
                    Enter the amount to process the payment.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...paymentForm}>
                    <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4 max-w-sm">
                        <FormField
                        control={paymentForm.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" placeholder="Enter amount" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Process Payment'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
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
                    className="space-y-2"
                    >
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between px-2">
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4"/> 
                            <span className="font-medium">Recipients ({subscribers.length})</span>
                         </div>
                        <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
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
