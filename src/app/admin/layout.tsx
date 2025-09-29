
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Ticket, Users, BarChart, Settings, Home, TicketPercent, Menu, LoaderCircle, Image as ImageIcon, Bell, FileText, Search, SlidersHorizontal, Link2, Landmark, Printer, MessageSquare, Cookie, Server, Broom, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import AdminAuth from '@/components/admin-auth';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubButton } from '@/components/ui/sidebar';

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
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket },
    { href: '/admin/vouchers/voucher-profiles', label: 'Voucher Profiles', icon: FileText },
    { href: '/admin/members', label: 'Members', icon: Users },
  ];

  const secondaryNav = [
      {
          label: '-- General',
          items: [
              { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
              { href: '/admin/settings', label: 'Settings', icon: Settings },
              { href: '/admin/subscribers', label: 'Subscribers', icon: Bell },
          ]
      },
      {
          label: '-- Payment Methods',
          items: [
              { href: '#', label: 'Add Money', icon: Landmark },
              { href: '#', label: 'Money Out', icon: Printer },
          ]
      },
      {
          label: '-- Notification',
          items: [
            { href: '#', label: 'Push Notification', icon: Bell },
            { href: '#', label: 'Contact Messages', icon: MessageSquare },
          ]
      },
      {
          label: '-- Bonus',
          items: [
              { href: '#', label: 'GDPR Cookie', icon: Cookie },
              { href: '#', label: 'Server Info', icon: Server },
              { href: '#', a: 'Clear Cache', icon: Broom },
          ]
      }
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
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon" className="group/sidebar">
        <SidebarContent className="p-2">
            <div className='flex justify-between items-center group-data-[collapsible=icon]:justify-center mb-4'>
                <div className='flex items-center gap-2 group-data-[collapsible=icon]:hidden'>
                    <TicketPercent className="h-7 w-7 text-[hsl(var(--highlight))]" />
                    <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">Luco</h1>
                </div>
                <ThemeToggle />
            </div>
            
             <SidebarGroup>
                <SidebarMenu>
                    {mainNav.map(item => (
                        <SidebarMenuItem key={item.href}>
                             <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            {secondaryNav.map(group => (
                 <SidebarGroup key={group.label}>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">{group.label}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map(item => (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                                    <Link href={item.href || "#"}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </SidebarContent>
        <SidebarFooter className='p-2'>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <Power/>
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Go to App">
                        <Link href="/">
                            <Home/>
                            <span>Go to App</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1">
         <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <SidebarTrigger className="md:hidden"/>
             <h1 className="text-xl font-semibold">
              {[...mainNav, ...secondaryNav.flatMap(g => g.items)].find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
         </header>
         <div className="p-6">
            {children}
         </div>
      </main>
    </SidebarProvider>
  );
}
