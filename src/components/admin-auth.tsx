
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { TicketPercent, User, Lock, LoaderCircle, Eye, EyeOff, Hand } from 'lucide-react';
import Link from 'next/link';
import { getAdminCredentials } from '@/lib/members';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type AdminAuthProps = {
  onLoginSuccess: () => void;
};

export default function AdminAuth({ onLoginSuccess }: AdminAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const admin = await getAdminCredentials();
      if (admin && values.username === admin.username && values.password === admin.password) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Albertine!',
        });
        onLoginSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password.',
        });
        form.reset();
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'Could not verify credentials. Please try again.',
      });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-foreground/5 transform rotate-45 opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-foreground/5 transform rotate-12 opacity-50"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-foreground/5 transform rotate-45 opacity-50"></div>
        <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-foreground/5 transform rotate-6 opacity-50"></div>

      <Card className="w-full max-w-sm rounded-lg z-10">
        <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                <TicketPercent className="h-8 w-8 text-purple-400" />
                <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Luco
                </h1>
            </div>
            <div className="flex items-center justify-center gap-2">
                <Hand className="h-6 w-6 text-yellow-400 animate-wave" />
                <p className="text-muted-foreground">Welcome To <span className="font-bold text-white">ADMIN PANEL</span></p>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Username</FormLabel>
                    <FormControl>
                       <div className="relative">
                        <Input placeholder="admin" {...field} />
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
                    <FormLabel className="text-muted-foreground">Password</FormLabel>
                    <FormControl>
                        <div className="relative">
                           <Input 
                             type={showPassword ? 'text' : 'password'}
                             placeholder="••••••••" 
                             {...field} 
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
                <div className="text-right">
                    <Link href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Forgot Password?
                    </Link>
                </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin" /> : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
