
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Wallet, Sun, Moon, Laptop, Mail, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';


const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Please enter an amount.'),
});
type PaymentFormValues = z.infer<typeof paymentSchema>;


export default function SettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, setTheme } = useTheme();

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
    },
  });

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
                        <p className="text-sm text-muted-foreground">Receive alerts about critical events via SMS.</p>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="sms-notifications" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
