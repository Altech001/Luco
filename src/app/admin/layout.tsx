
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Lock, LogIn, User, LayoutDashboard, LogOut, Ticket, Users, BarChart, Settings, Home, TicketPercent, Menu, LoaderCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { collection, query, where, getDocs, addDoc, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";


const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminLoggedIn');
    setIsLoggedIn(authStatus === 'true');
    setIsCheckingAuth(false);
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
        const adminsRef = collection(db, "admins");
        const q = query(adminsRef, where("username", "==", values.username), where("password", "==", values.password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            setIsLoggedIn(true);
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            toast({
                title: 'Login Successful',
                description: `Welcome, ${values.username}!`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid username or password.',
            });
        }
    } catch (error) {
        console.error("Firebase auth error:", error);
        toast({
            variant: 'destructive',
            title: 'Login Error',
            description: 'Could not connect to authentication service.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isAdminLoggedIn');
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
    });
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket },
    { href: '/admin/subscribers', label: 'Subscribers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const NavLinks = ({isMobile = false}: {isMobile?: boolean}) => (
    <nav className={cn("flex flex-col gap-2", isMobile ? "p-4" : "")}>
        {navItems.map(item => (
        <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setIsMobileNavOpen(false)}
            className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === item.href && 'bg-accent text-primary'
            )}
        >
            <item.icon className="h-4 w-4" />
            {item.label}
        </Link>
        ))}
    </nav>
  );

  if (isCheckingAuth) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <LogIn className="mr-2" />} 
                  {isLoading ? 'Verifying...' : 'Login'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="flex items-center gap-2 sm:gap-3 mb-8">
          <TicketPercent className="h-7 w-7 text-[hsl(var(--highlight))]" />
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
            Luco
          </h1>
        </div>
        <NavLinks />
        <div className="mt-auto flex flex-col gap-2">
           <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-3">
                    <Home className="h-4 w-4"/>
                    Go to App
                </Link>
           </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-4">
                 <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Navigation</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                         <SheetHeader className="sr-only">
                            <SheetTitle>Admin Menu</SheetTitle>
                            <SheetDescription>Navigation links for the admin dashboard.</SheetDescription>
                        </SheetHeader>
                         <div className="flex items-center gap-2 sm:gap-3 p-4 border-b">
                            <TicketPercent className="h-7 w-7 text-[hsl(var(--highlight))]" />
                            <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
                                Luco
                            </h1>
                        </div>
                        <NavLinks isMobile />
                         <div className="p-4 mt-auto border-t">
                            <Button variant="outline" asChild className="w-full">
                                    <Link href="/" className="flex items-center gap-3">
                                        <Home className="h-4 w-4"/>
                                        Go to App
                                    </Link>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                 <h1 className="text-xl font-semibold md:hidden">
                    {navItems.find(item => item.href === pathname)?.label}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button variant="outline" onClick={handleLogout} size="sm">
                    <LogOut className="mr-2 h-4 w-4"/> Logout
                </Button>
            </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
