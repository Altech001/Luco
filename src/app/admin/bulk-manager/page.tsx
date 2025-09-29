
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Send } from 'lucide-react';
import { getSubscribers } from '@/lib/subscribers';

const bulkSmsSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type BulkSmsFormValues = z.infer<typeof bulkSmsSchema>;

export default function BulkManagerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BulkSmsFormValues>({
    resolver: zodResolver(bulkSmsSchema),
    defaultValues: {
      message: '',
    },
  });

  const handleBulkSmsSubmit = async (values: BulkSmsFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, you would fetch subscribers and send the SMS here.
      const subscribers = await getSubscribers();
      
      console.log(`Sending message "${values.message}" to ${subscribers.length} subscribers.`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Bulk SMS Sent!',
        description: `Your message has been queued for delivery to ${subscribers.length} subscribers.`,
      });
      form.reset();
    } catch (error) {
      console.error("Failed to send bulk SMS:", error);
      toast({
        variant: 'destructive',
        title: 'Send Failed',
        description: 'There was an error sending the bulk SMS.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bulk Manager</h1>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>Send Bulk SMS</CardTitle>
                <CardDescription>
                    Compose a message and send it to all your subscribers at once.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleBulkSmsSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Type your promotional message here..."
                                    className="resize-none"
                                    rows={5}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                         Send to All Subscribers
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
