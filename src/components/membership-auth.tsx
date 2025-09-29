'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { UserPlus, LogIn, KeyRound, Smartphone, User, Lock, Send, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'initial' | 'login' | 'register' | 'credentials';

const loginSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

type UserCredentials = {
  username: string;
  password?: string;
};

const MotionDiv = motion.div;

export default function MembershipAuth({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<AuthStep>('initial');
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', password: '', phone: '' },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    // In a real app, you'd fetch this from your backend
    const fetchedCredentials = { username: 'member123', password: 'password123' };
    setCredentials(fetchedCredentials);
    setStep('credentials');
    setIsLoading(false);
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    setCredentials({ username: values.username, password: values.password });
    setStep('credentials');
    setIsLoading(false);
  };

  const handleSendSms = () => {
    toast({
        title: "SMS Sent!",
        description: "Your credentials have been sent to your phone."
    });
    onComplete();
  }

  const renderStep = () => {
    switch (step) {
      case 'initial':
        return (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogHeader>
              <DialogTitle>Join the Club</DialogTitle>
              <DialogDescription>Become a member or sign in to see your perks.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2">
              <Button variant="outline" onClick={() => setStep('login')}>
                <LogIn className="mr-2" /> Already a Member
              </Button>
              <Button onClick={() => setStep('register')}>
                <UserPlus className="mr-2" /> Become a Member
              </Button>
            </div>
          </MotionDiv>
        );
      case 'login':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <DialogHeader>
              <DialogTitle>Member Sign In</DialogTitle>
              <DialogDescription>Enter your phone number to retrieve your credentials.</DialogDescription>
            </DialogHeader>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6 pt-4">
                <FormField
                  control={loginForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+1234567890" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <KeyRound className="mr-2" />}
                    Retrieve Credentials
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep('initial')}>Back</Button>
              </form>
            </Form>
          </MotionDiv>
        );
      case 'register':
        return (
          <MotionDiv initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <DialogHeader>
              <DialogTitle>Create Your Account</DialogTitle>
              <DialogDescription>Join now to unlock exclusive member benefits.</DialogDescription>
            </DialogHeader>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 pt-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Your username" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                         <div className="relative">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+1234567890" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <UserPlus className="mr-2" />}
                    Create Account
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep('initial')}>Back</Button>
              </form>
            </Form>
          </MotionDiv>
        );
        case 'credentials':
            return (
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader>
                  <DialogTitle>Your Credentials</DialogTitle>
                  <DialogDescription>Here is your login information. You can send it to your phone via SMS.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                    <div className="rounded-md border bg-muted p-4">
                        <p className="text-sm font-medium text-muted-foreground">Username</p>
                        <p className="text-lg font-semibold">{credentials?.username}</p>
                    </div>
                    <div className="rounded-md border bg-muted p-4">
                        <p className="text-sm font-medium text-muted-foreground">Password</p>
                        <p className="font-mono text-lg font-semibold tracking-wider">{credentials?.password}</p>
                    </div>
                </div>
                <Button className="w-full" onClick={handleSendSms}>
                    <Send className="mr-2"/> Send via SMS
                </Button>
              </MotionDiv>
            );
      default:
        return null;
    }
  };

  return (
    <div className="p-2">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
