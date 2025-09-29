
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
import { Users, Bell, Palette, Tag, Lock, Send, LoaderCircle, Eye, EyeOff, Settings as SettingsIcon, Shield, SlidersHorizontal, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
  promoPaymentsEnabled: z.boolean().default(false),
})
type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;


export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSubmittingCreds, setIsSubmittingCreds] = useState(false);
  const [isSubmittingSms, setIsSubmittingSms] = useState(false);
  const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('general');


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
      promoPaymentsEnabled: false,
    },
  });

  const handleCredsSubmit = (values: AdminCredsFormValues) => {
    setIsSubmittingCreds(true);
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
    setTimeout(() => {
        toast({
            title: 'Bulk SMS Sent',
            description: `Your message has been queued for delivery to all subscribers.`
        });
        smsForm.reset();
        setIsSubmittingSms(false);
    }, 1500)
  }

  const handleGeneralSubmit = (values: GeneralSettingsFormValues) => {
    setIsSubmittingGeneral(true);
    setTimeout(() => {
      setTheme(values.promoPaymentsEnabled ? 'dark' : 'light'); // Example logic
      toast({
        title: 'Settings Saved',
        description: 'Your general settings have been updated.',
      });
      setIsSubmittingGeneral(false);
    }, 1000);
  };

  const handleThemeChange = (isDarkMode: boolean) => {
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const navItems = [
    { id: 'general', label: 'General', icon: SlidersHorizontal },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="flex flex-row md:flex-col gap-2 md:w-48">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                activeTab === item.id && 'bg-accent text-primary font-semibold'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Customize app appearance and promotion rules.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalSettingsForm}>
                  <form onSubmit={generalSettingsForm.handleSubmit(handleGeneralSubmit)} className="space-y-6">
                     <FormField
                        control={generalSettingsForm.control}
                        name="promoPaymentsEnabled"
                        render={({ field }) => (
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
                    <Separator />
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
                    <Button type="submit" disabled={isSubmittingGeneral}>
                        {isSubmittingGeneral ? <LoaderCircle className="animate-spin" /> : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                    Manage administrator credentials and user access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <h3 className="text-lg font-medium flex items-center gap-2"><Lock /> Admin Credentials</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update your administrator login details.</p>
                         <Form {...adminCredsForm}>
                            <form onSubmit={adminCredsForm.handleSubmit(handleCredsSubmit)} className="space-y-4 max-w-sm">
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
                    </div>
                     <Separator />
                     <div>
                        <h3 className="text-lg font-medium flex items-center gap-2"><Users /> User Management</h3>
                        <p className="text-sm text-muted-foreground mb-4">View and manage your members and subscribers.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild variant="outline">
                                <Link href="/admin/members">Manage Members</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/admin/subscribers">Manage Subscribers</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
             <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                    Communicate with your subscribers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <h3 className="text-lg font-medium flex items-center gap-2"><MessageSquare /> Bulk SMS</h3>
                        <p className="text-sm text-muted-foreground mb-4">Send a message to all your subscribers at once.</p>
                        <Form {...smsForm}>
                            <form onSubmit={smsForm.handleSubmit(handleSmsSubmit)} className="space-y-4 max-w-sm">
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
                                    {isSubmittingSms ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send to All Subscribers
                                </Button>
                            </form>
                        </Form>
                     </div>
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
