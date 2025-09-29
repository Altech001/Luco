
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Ticket, Users, BarChart, Settings, Home, TicketPercent, Menu, LoaderCircle, Image as ImageIcon, Bell, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import AdminAuth from '@/components/admin-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket },
    { href: '/admin/vouchers/voucher-profiles', label: 'Voucher Profiles', icon: FileText },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/subscribers', label: 'Subscribers', icon: Bell },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
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
    return <AdminAuth onLoginSuccess={handleLoginSuccess} />;
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
              <Home className="h-4 w-4" />
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
                 <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2 sm:gap-3">
                      <TicketPercent className="h-7 w-7 text-[hsl(var(--highlight))]" />
                      <span className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
                        Luco
                      </span>
                    </SheetTitle>
                 </SheetHeader>
                <NavLinks isMobile />
                <div className="p-4 mt-auto border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/" className="flex items-center gap-3">
                      <Home className="h-4 w-4" />
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
              Logout
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
