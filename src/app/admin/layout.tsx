
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Ticket, Users, BarChart, Settings, Home, TicketPercent, LoaderCircle, Image as ImageIcon, Bell, FileText, Search, Power, MessageSquareQuestion, SlidersHorizontal, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import AdminAuth from '@/components/admin-auth';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminLoggedIn');
    setIsLoggedIn(authStatus === 'true');
    setIsCheckingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('isAdminLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isAdminLoggedIn');
    toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
    });
  };
  
  const mainNav = [
    { href: '/admin', label: 'Dashboard', icon: SlidersHorizontal },
    { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket },
    { href: '/admin/bulk-manager', label: 'Bulk Manager', icon: MessageSquareQuestion },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/subscribers', label: 'Subscribers', icon: Bell },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  ];

  const bottomNav = [
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/', label: 'Go to App', icon: Home },
    { action: handleLogout, label: 'Logout', icon: Power },
  ]


  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminAuth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <TooltipProvider>
        <div className="flex min-h-screen">
            <aside className="w-16 flex flex-col items-center gap-y-4 py-4 bg-background border-r">
                <div className="flex items-center justify-center">
                    <TicketPercent className="h-7 w-7 text-primary" />
                </div>
                <nav className="flex flex-col gap-y-2 flex-1">
                    {mainNav.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                <Link href={item.href}>
                                    <Button variant={pathname === item.href ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10">
                                        <item.icon className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={5}>
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </nav>
                <div className="flex flex-col gap-y-2 mt-auto">
                    <ThemeToggle />
                     {bottomNav.map((item) => (
                        <Tooltip key={item.label}>
                            <TooltipTrigger asChild>
                                {item.href ? (
                                    <Link href={item.href}>
                                        <Button variant='ghost' size="icon" className="h-10 w-10">
                                            <item.icon className="h-5 w-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                     <Button onClick={item.action} variant='ghost' size="icon" className="h-10 w-10">
                                        <item.icon className="h-5 w-5" />
                                    </Button>
                                )}
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={5}>
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </aside>
            <main className="flex-1">
                 <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
                    <h1 className="text-xl font-semibold">
                        {[...mainNav].find(item => item.href === pathname)?.label || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                            <Search className="mr-2 h-4 w-4" />
                            Search...
                        </Button>
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    </TooltipProvider>
  );
}
