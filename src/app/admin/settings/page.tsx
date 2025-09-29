
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Users, Bell, Palette, Tag, Lock, Send, LoaderCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const adminCredsSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type AdminCredsFormValues = z.infer<typeof adminCredsSchema>;

const smsSchema = z.object({
    message: z.string().min(10, 'Message must be at least 10 characters long.')
});

type SmsFormValues = z.infer<typeof smsSchema>;

const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
})
type AppearanceFormValues = z.infer<typeof appearanceSchema>

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSubmittingCreds, setIsSubmittingCreds] = useState(false);
  const [isSubmittingSms, setIsSubmittingSms] = useState(false);
  const [promoPaymentsEnabled, setPromoPaymentsEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const adminCredsForm = useForm<AdminCredsFormValues>({
    resolver: zodResolver(adminCredsSchema),
    defaultValues: {
      username: 'admin',
      password: '',
    },
  });
  
  const smsForm = useForm<SmsFormValues>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
        message: '',
    }
  });

   const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      theme: theme as "light" | "dark" | "system",
    },
  })

  const handleCredsSubmit = (values: AdminCredsFormValues) => {
    setIsSubmittingCreds(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Credentials Updated',
        description: 'Your admin login details have been changed.',
      });
      adminCredsForm.reset({ username: values.username, password: '' });
      setIsSubmittingCreds(false);
    }, 1000);
  };
  
  const handleSmsSubmit = (values: SmsFormValues) => {
    setIsSubmittingSms(true);
    // Simulate API call
    setTimeout(() => {
        toast({
            title: 'Bulk SMS Sent',
            description: `Your message has been queued for delivery to all subscribers.`
        });
        smsForm.reset();
        setIsSubmittingSms(false);
    }, 1500)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* User Management */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> User Management</CardTitle>
            <CardDescription>
              View and manage your members and subscribers.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <Button asChild variant="outline">
                <Link href="/admin/members">Manage Members</Link>
             </Button>
             <Button asChild variant="outline">
                <Link href="/admin/subscribers">Manage Subscribers</Link>
             </Button>
          </CardContent>
        </Card>

        {/* Bulk SMS */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell /> Bulk SMS Notifications</CardTitle>
            <CardDescription>
              Send a message to all your subscribers at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...smsForm}>
                <form onSubmit={smsForm.handleSubmit(handleSmsSubmit)} className="space-y-4">
                     <FormField
                        control={smsForm.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Type your notification message here..."
                                className="resize-none"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isSubmittingSms}>
                        {isSubmittingSms ? <LoaderCircle className="animate-spin" /> : <Send />}
                        Send to All Subscribers
                    </Button>
                </form>
            </Form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette /> Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...appearanceForm}>
              <FormField
                control={appearanceForm.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Theme</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setTheme(value);
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="light" />
                          </FormControl>
                          <FormLabel className="font-normal">Light</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dark" />
                          </FormControl>
                          <FormLabel className="font-normal">Dark</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="system" />
                          </FormControl>
                          <FormLabel className="font-normal">System</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </CardContent>
        </Card>

        {/* Promotions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tag /> Promotions</CardTitle>
            <CardDescription>
              Configure how promotional vouchers work.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Payments for Promos
                  </FormLabel>
                  <FormDescription>
                    If enabled, "Promo" category vouchers can have a price.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={promoPaymentsEnabled}
                    onCheckedChange={setPromoPaymentsEnabled}
                  />
                </FormControl>
              </FormItem>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock /> Admin Credentials</CardTitle>
            <CardDescription>
              Update your administrator login details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...adminCredsForm}>
              <form onSubmit={adminCredsForm.handleSubmit(handleCredsSubmit)} className="space-y-4">
                <FormField
                  control={adminCredsForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminCredsForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••" 
                            {...field} 
                            className="pr-10" 
                            />
                            <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmittingCreds}>
                  {isSubmittingCreds ? <LoaderCircle className="animate-spin" /> : 'Save Credentials'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    