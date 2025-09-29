
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
import { PlusCircle, LoaderCircle, Image as ImageIcon, FileText, Bot, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import { collection, addDoc, getDocs, Timestamp, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBanners, deleteBanner } from '@/lib/banners';
import type { Banner } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const bannerSchema = z.object({
  imageUrl: z.string().url('Please enter a valid image URL.'),
  description: z.string().min(1, 'Description is required.'),
  imageHint: z.string().min(1, 'AI hint is required.'),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

function BannerForm({
  initialValues,
  onSubmit,
  isSubmitting,
  onClose,
}: {
  initialValues?: BannerFormValues;
  onSubmit: (values: BannerFormValues) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
}) {
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: initialValues || {
      imageUrl: '',
      description: '',
      imageHint: '',
    },
  });

  const handleFormSubmit = async (values: BannerFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Save Banner'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

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

  const handleAddSubmit = async (values: BannerFormValues) => {
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
      setIsAddDialogOpen(false);
      fetchBanners();
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

  const handleEditSubmit = async (values: BannerFormValues) => {
    if (!selectedBanner) return;
    setIsSubmitting(true);
    try {
      const bannerRef = doc(db, 'banners', selectedBanner.id);
      await updateDoc(bannerRef, {
        ...values,
      });
      toast({
        title: 'Banner Updated',
        description: 'The banner has been successfully updated.',
      });
      setIsEditDialogOpen(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to update banner',
        description: 'There was a problem updating the banner.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (bannerId: string) => {
    try {
      await deleteBanner(bannerId);
      toast({
        title: 'Banner Deleted',
        description: 'The banner has been removed.',
      });
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the banner.',
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Banners</h1>
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
              <DialogDescription>Fill out the form to add a new banner to the homepage carousel.</DialogDescription>
            </DialogHeader>
            <BannerForm 
              onSubmit={handleAddSubmit}
              isSubmitting={isSubmitting}
              onClose={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Banners</CardTitle>
          <CardDescription>This is a list of banners currently active on the homepage.</CardDescription>
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
                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">AI Hint</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.length > 0 ? (
                    banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            alt={banner.description}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={banner.imageUrl}
                            width="64"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{banner.description}</TableCell>
                        <TableCell className="hidden md:table-cell">{banner.imageHint}</TableCell>
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
                                  <DropdownMenuItem onSelect={() => window.open(banner.imageUrl, '_blank')}>
                                    <Eye className="mr-2 h-4 w-4"/> Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setSelectedBanner(banner);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
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
                                  This action cannot be undone. This will permanently delete the banner.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(banner.id)}>
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
                      <TableCell colSpan={4} className="h-24 text-center">
                        No banners found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
            <DialogDescription>Make changes to the banner details below.</DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <BannerForm
              initialValues={selectedBanner}
              onSubmit={handleEditSubmit}
              isSubmitting={isSubmitting}
              onClose={() => {
                setIsEditDialogOpen(false);
                setSelectedBanner(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
