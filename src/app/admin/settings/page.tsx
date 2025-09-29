
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Users, Bell, Palette, Tag, Lock, Send, LoaderCircle, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const adminCredsSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type AdminCredsFormValues = z.infer<typeof adminCredsSchema>;

const smsSchema = z.object({
    message: z.string().min(10, 'Message must be at least 10 characters long.')
});

type SmsFormValues = z.infer<typeof smsSchema>;

const generalSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  promoPaymentsEnabled: z.boolean().default(false),
})
type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;


export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSubmittingCreds, setIsSubmittingCreds] = useState(false);
  const [isSubmittingSms, setIsSubmittingSms] = useState(false);
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

   const generalSettingsForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      theme: (theme as "light" | "dark") || "light",
      promoPaymentsEnabled: false,
    },
  });

  useEffect(() => {
    generalSettingsForm.setValue('theme', (theme as "light" | "dark") || "light");
  }, [theme, generalSettingsForm]);

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

  const handleThemeChange = (isDarkMode: boolean) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
    generalSettingsForm.setValue('theme', newTheme);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* User Management & Credentials */}
        <div className="flex flex-col gap-8">
            <Card>
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
             <Card>
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

        {/* Bulk SMS & General Settings */}
        <div className="flex flex-col gap-8">
            <Card>
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
                                    rows={4}
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

            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><SettingsIcon /> General Settings</CardTitle>
                <CardDescription>
                Customize app appearance and promotion rules.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...generalSettingsForm}>
                    <form>
                        <FormField
                            control={generalSettingsForm.control}
                            name="theme"
                            render={() => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base flex items-center gap-2"><Palette/> Appearance</FormLabel>
                                        <FormDescription>
                                            Enable to switch to a dark theme.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={handleThemeChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Separator className="my-6" />

                        <FormField
                            control={generalSettingsForm.control}
                            name="promoPaymentsEnabled"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center gap-2"><Tag/> Promotions</FormLabel>
                                <FormDescription>
                                    Allow "Promo" category vouchers to have a price.
                                </FormDescription>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
    