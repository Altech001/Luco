
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, TicketPercent, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '../theme-toggle';
import { addSubscriber } from '@/lib/subscribers';

export default function Header() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const whatsapp = formData.get('whatsapp') as string;

    if (whatsapp) {
      try {
        await addSubscriber(whatsapp);
        toast({
          title: 'Subscription Successful!',
          description: "You'll be the first to know about new promotions on WhatsApp.",
        });
        setOpen(false);
      } catch (error: any) {
         toast({
          variant: 'destructive',
          title: 'Subscription Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <TicketPercent className="h-7 w-7 text-[hsl(var(--highlight))]" />
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
            Luco
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="mr-0 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Get Notifications</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubscribe}>
                <DialogHeader>
                  <DialogTitle>Stay Updated on WhatsApp</DialogTitle>
                  <DialogDescription>
                    Enter your WhatsApp number to receive notifications about new promotions and
                    exclusive deals.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="whatsapp" className="text-right">
                      WhatsApp
                    </Label>
                    <div className="relative col-span-3">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="whatsapp" name="whatsapp" type="tel" required placeholder="+1234567890" className="pl-10" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <User className="mr-0 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
