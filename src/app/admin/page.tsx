
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogIn, User, LayoutDashboard, LogOut } from 'lucide-react';
import Header from '@/components/layout/header';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    if (values.username === 'Albertine' && values.password === 'password') {
      setIsLoggedIn(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome, Albertine!',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="Username" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="Password" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <LogIn className="mr-2" /> Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2"/> Logout</Button>
        </div>
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LayoutDashboard /> Welcome, Albertine!</CardTitle>
                <CardDescription>This is your admin dashboard. More features coming soon!</CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can manage users, view analytics, and configure settings from this panel.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
