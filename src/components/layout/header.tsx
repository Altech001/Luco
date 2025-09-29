'use client';

import * as React from 'react';
import { Bell, Ticket, Mail } from 'lucide-react';
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

export default function Header() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    if (email) {
      console.log('Subscribing email:', email);
      toast({
        title: 'Subscription Successful!',
        description: "You'll be the first to know about new promotions.",
      });
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Ticket className="h-7 w-7 text-[hsl(var(--highlight))]" />
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight">
            Luco Coupons
          </h1>
        </div>
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
                <DialogTitle>Stay Updated</DialogTitle>
                <DialogDescription>
                  Enter your email to receive notifications about new promotions and
                  exclusive deals.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <div className="relative col-span-3">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" required placeholder="you@example.com" className="pl-10" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Subscribe</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
