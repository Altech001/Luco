
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, LoaderCircle, MoreHorizontal, Pencil, Trash2, Smartphone } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getSubscribers, deleteSubscriber, updateSubscriber } from '@/lib/subscribers';
import type { Subscriber } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import Papa from 'papaparse';

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
const SUBSCRIBERS_PER_PAGE = 5;

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
  });

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const subscribersData = await getSubscribers();
      setSubscribers(subscribersData);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to load subscribers',
        description: 'Could not fetch subscriber data from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (selectedSubscriber) {
      form.setValue('phone', selectedSubscriber.phone);
    }
  }, [selectedSubscriber, form]);

  const handleExport = () => {
    const csv = Papa.unparse(subscribers.map(s => ({
      phone: s.phone,
      subscribedAt: format(s.subscribedAt, 'yyyy-MM-dd HH:mm:ss'),
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Export Complete',
      description: 'The subscriber list has been downloaded as a CSV file.',
    });
  };

  const handleUpdateSubmit = async (values: PhoneFormValues) => {
    if (!selectedSubscriber) return;
    setIsSubmitting(true);
    try {
      await updateSubscriber(selectedSubscriber.id, values.phone);
      toast({
        title: 'Subscriber Updated',
        description: 'The phone number has been successfully updated.',
      });
      setIsEditDialogOpen(false);
      setSelectedSubscriber(null);
      fetchSubscribers();
    } catch (error) {
      console.error("Error updating subscriber:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to update subscriber',
        description: 'There was a problem updating the phone number.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (subscriberId: string) => {
    try {
      await deleteSubscriber(subscriberId);
      toast({
        title: 'Subscriber Deleted',
        description: 'The subscriber has been removed.',
      });
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the subscriber.',
      });
    }
  };

  const totalPages = Math.ceil(subscribers.length / SUBSCRIBERS_PER_PAGE);
  const paginatedSubscribers = subscribers.slice(
    (currentPage - 1) * SUBSCRIBERS_PER_PAGE,
    currentPage * SUBSCRIBERS_PER_PAGE
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Subscribers</h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={subscribers.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>
            Here are all the users subscribed to your notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
             <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Subscribed On</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubscribers.length > 0 ? (
                    paginatedSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.phone}</TableCell>
                        <TableCell>{format(subscriber.subscribedAt, 'PPP p')}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => {
                                    setSelectedSubscriber(subscriber);
                                    setIsEditDialogOpen(true);
                                  }}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the subscriber.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(subscriber.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No subscribers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    Page {totalPages > 0 ? currentPage : 0} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>Update the subscriber's phone number below.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
