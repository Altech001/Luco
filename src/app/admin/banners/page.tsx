
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, LoaderCircle, Image as ImageIcon, FileText, Bot } from 'lucide-react';
import Image from 'next/image';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBanners } from '@/lib/banners';
import type { Banner } from '@/types';

const bannerSchema = z.object({
  imageUrl: z.string().url('Please enter a valid image URL.'),
  description: z.string().min(1, 'Description is required.'),
  imageHint: z.string().min(1, 'AI hint is required.'),
});

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      imageUrl: '',
      description: '',
      imageHint: '',
    },
  });

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const bannersData = await getBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to load banners',
        description: 'Could not fetch banner data from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onSubmit = async (values: z.infer<typeof bannerSchema>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'banners'), {
        ...values,
        createdAt: Timestamp.now(),
      });
      toast({
        title: 'Banner Added',
        description: 'The new promotional banner has been saved.',
      });
      form.reset();
      fetchBanners(); // Refresh banner list
    } catch (error) {
      console.error("Error adding banner:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to add banner',
        description: 'There was a problem saving the banner.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Banners</h1>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle /> Add New Banner</CardTitle>
              <CardDescription>Fill out the form to add a new banner to the homepage carousel.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://images.unsplash.com/..." {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                         <FormControl>
                           <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., A vibrant coffee promotion" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageHint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Hint</FormLabel>
                         <FormControl>
                           <div className="relative">
                            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., coffee promotion" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Add Banner'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Banners</CardTitle>
              <CardDescription>This is a list of banners currently active on the homepage.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                 <div className="flex items-center justify-center py-20">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : banners.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {banners.map((banner) => (
                    <div key={banner.id} className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.description}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <p className="absolute bottom-2 left-2 text-xs font-semibold text-white">{banner.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-20 text-center">
                  <h3 className="font-headline text-xl font-semibold">No Banners Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use the form to add your first promotional banner.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
