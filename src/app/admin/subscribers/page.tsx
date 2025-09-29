
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, LoaderCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getSubscribers } from '@/lib/subscribers';
import type { Subscriber } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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

    fetchSubscribers();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Subscribers</h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline" disabled>
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
             <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Subscribed On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length > 0 ? (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.phone}</TableCell>
                        <TableCell>{format(subscriber.subscribedAt, 'PPP p')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No subscribers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
