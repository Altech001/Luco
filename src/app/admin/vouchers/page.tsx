
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, LoaderCircle, MoreHorizontal, Pencil, Trash2, Ticket, Tag, Calendar, DollarSign, Percent, FileText, Upload, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import type { Voucher, VoucherProfile } from '@/types';
import { getVouchers, addVoucher, updateVoucher, deleteVoucher, batchAddVouchers, getVoucherProfiles, batchDeleteVouchers } from '@/lib/vouchers';
import { voucherCategoriesData } from '@/lib/data';
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const voucherSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  category: z.string().min(1, 'Category is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  discount: z.string().min(1, 'Discount is required.'),
  expiryDate: z.string().min(1, 'Expiry date is required.'),
  code: z.string().min(1, 'Voucher code is required.'),
  isNew: z.boolean().default(false),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

function VoucherForm({
  initialValues,
  onSubmit,
  isSubmitting,
  voucherProfiles
}: {
  initialValues?: VoucherFormValues;
  onSubmit: (values: VoucherFormValues) => Promise<void>;
  isSubmitting: boolean;
  voucherProfiles: VoucherProfile[];
}) {
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: initialValues || {
      title: '',
      description: '',
      category: '',
      price: 0,
      discount: '',
      expiryDate: '',
      code: '',
      isNew: false,
    },
  });

  const handleFormSubmit = async (values: VoucherFormValues) => {
    await onSubmit(values);
    form.reset();
  };
  
  const categories = [...new Set(voucherProfiles.map(p => p.category))];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="e.g., Morning Coffee Boost" {...field} className="pl-10" />
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
                  <Input placeholder="e.g., Get any regular coffee..." {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                 <FormControl>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1000" {...field} className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                 <FormControl>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., 50% or BOGO" {...field} className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                 <FormControl>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., 24 Dec 2024" {...field} className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voucher Code</FormLabel>
                 <FormControl>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., LUCODAY50" {...field} className="pl-10" />
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>New Tag</FormLabel>
                  <FormDescription>
                    Display a "New!" badge on this voucher.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Save Voucher'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

const importSchema = z.object({
  profileId: z.string().min(1, "Please select a profile."),
  csvFile: z.instanceof(FileList).refine(files => files?.length === 1, "CSV file is required."),
});
type ImportFormValues = z.infer<typeof importSchema>;

function ImportDialog({ isImportOpen, setIsImportOpen, voucherProfiles, onImport, isSubmitting }: {
  isImportOpen: boolean,
  setIsImportOpen: (open: boolean) => void,
  voucherProfiles: VoucherProfile[],
  onImport: (data: ImportFormValues) => void,
  isSubmitting: boolean
}) {
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
  });
  const fileRef = form.register("csvFile");

  return (
     <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Vouchers from CSV</DialogTitle>
            <DialogDescription>Select a profile and upload a Mikrotik-compatible CSV file.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onImport)} className="space-y-4">
              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voucher Profile</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a profile for this import" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {voucherProfiles.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="csvFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CSV File</FormLabel>
                    <FormControl>
                      <Input type="file" accept=".csv" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Import Vouchers'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherProfiles, setVoucherProfiles] = useState<VoucherProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [view, setView] = useState<'grid' | 'table' | 'purchased'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vouchersData, profilesData] = await Promise.all([
        getVouchers(true),
        getVoucherProfiles()
      ]);
      setVouchers(vouchersData);
      setVoucherProfiles(profilesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to load data',
        description: 'Could not fetch vouchers or profiles from the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
        setSelectedVoucher(null);
    }
    setIsAddEditDialogOpen(open);
  }

  const handleSubmit = async (values: VoucherFormValues) => {
    setIsSubmitting(true);
    try {
        if (selectedVoucher) {
            await updateVoucher(selectedVoucher.id, values);
             toast({
                title: 'Voucher Updated',
                description: 'The voucher has been successfully updated.',
            });
        } else {
            await addVoucher(values);
            toast({
                title: 'Voucher Added',
                description: 'The new voucher has been saved.',
            });
        }
      setIsAddEditDialogOpen(false);
      setSelectedVoucher(null);
      fetchData();
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to save voucher',
        description: 'There was a problem saving the voucher.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (voucherId: string) => {
    try {
      await deleteVoucher(voucherId);
      toast({
        title: 'Voucher Deleted',
        description: 'The voucher has been removed.',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the voucher.',
      });
    }
  };

  const handleBatchDelete = async () => {
    setIsSubmitting(true);
    try {
      await batchDeleteVouchers(selectedVouchers);
      toast({
        title: 'Vouchers Deleted',
        description: `${selectedVouchers.length} vouchers have been removed.`,
      });
      setSelectedVouchers([]);
      fetchData();
    } catch (error) {
      console.error('Error deleting vouchers:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the selected vouchers.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async (data: ImportFormValues) => {
    setIsSubmitting(true);
    const file = data.csvFile[0];
    const profile = voucherProfiles.find(p => p.id === data.profileId);
    if (!profile) {
      toast({ variant: 'destructive', title: 'Import Error', description: 'Selected profile not found.' });
      setIsSubmitting(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const newVouchers = results.data.map((row: any) => {
            const timeLimit = row['Time Limit'];
            let expiryDate = format(addDays(new Date(), 30), 'dd MMM yyyy'); // Default
            if (timeLimit && /^\d+d$/.test(timeLimit)) {
              const days = parseInt(timeLimit.replace('d', ''));
              expiryDate = format(addDays(new Date(), days), 'dd MMM yyyy');
            }

            return {
              title: profile.title,
              description: profile.description,
              category: profile.category,
              price: profile.price,
              discount: profile.discount,
              code: row.Username,
              expiryDate: expiryDate,
              isNew: true,
            };
          });

          await batchAddVouchers(newVouchers);
          toast({
            title: `Import Successful`,
            description: `${newVouchers.length} vouchers have been added.`,
          });
          setIsImportOpen(false);
          fetchData();
        } catch (error) {
          console.error("Error importing vouchers:", error);
          toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not save the imported vouchers.' });
        } finally {
          setIsSubmitting(false);
        }
      },
      error: (error) => {
        console.error("CSV Parsing error:", error);
        toast({ variant: 'destructive', title: 'CSV Error', description: 'Failed to parse the CSV file.' });
        setIsSubmitting(false);
      }
    });
  };
  
  const formattedPrice = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(price);

  const { vouchersByCategory, purchasedCount } = useMemo(() => {
    const categorized = vouchers.reduce((acc, voucher) => {
      const category = voucher.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(voucher);
      return acc;
    }, {} as Record<string, Voucher[]>);

    const purchased = vouchers.filter(v => v.status === 'purchased').length;

    return { vouchersByCategory: categorized, purchasedCount: purchased };
  }, [vouchers]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedVouchers([]);
    setView('table');
  };
  
  useEffect(() => {
    setSelectedVouchers([]);
  }, [selectedCategory]);

  const currentVouchers = selectedCategory ? vouchersByCategory[selectedCategory] || [] : [];
  const purchasedVouchers = vouchers.filter(v => v.status === 'purchased');
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVouchers(currentVouchers.map(v => v.id));
    } else {
      setSelectedVouchers([]);
    }
  };

  const handleRowSelect = (voucherId: string, checked: boolean) => {
    if (checked) {
      setSelectedVouchers(prev => [...prev, voucherId]);
    } else {
      setSelectedVouchers(prev => prev.filter(id => id !== voucherId));
    }
  };

  const renderGridView = () => (
    <>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">Manage Vouchers</h1>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button onClick={() => setIsAddEditDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Voucher
          </Button>
        </div>
      </div>
       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Voucher Categories</CardTitle>
          <CardDescription>Select a category to view and manage its vouchers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex items-center justify-center py-20">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {voucherCategoriesData.map(category => {
                const categoryVouchers = vouchersByCategory[category.name] || [];
                const CategoryIcon = category.icon;
                return (
                  <Card 
                    key={category.name}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{categoryVouchers.length}</div>
                      <p className="text-xs text-muted-foreground">Vouchers</p>
                    </CardContent>
                  </Card>
                )
              })}
               <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow bg-green-500/10 dark:bg-green-500/5 border-green-500/20"
                    onClick={() => setView('purchased')}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Purchased Vouchers</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{purchasedCount}</div>
                      <p className="text-xs text-green-500 dark:text-green-500">Vouchers</p>
                    </CardContent>
                </Card>
            </div>
          )}
        </CardContent>
       </Card>
    </>
  );

  const renderTableView = () => (
    <AlertDialog>
      <div className="flex items-center justify-between gap-2">
        <div className='flex items-center gap-4'>
           <Button variant="outline" size="icon" onClick={() => setView('grid')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{selectedCategory} Vouchers</h1>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button onClick={() => setIsAddEditDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Voucher
          </Button>
        </div>
      </div>
       <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Voucher List</CardTitle>
              <CardDescription>Here are all the vouchers for the {selectedCategory} category.</CardDescription>
            </div>
             {selectedVouchers.length > 0 && (
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isSubmitting}>
                        {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete ({selectedVouchers.length})
                    </Button>
                </AlertDialogTrigger>
            )}
          </div>
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
                    <TableHead padding="checkbox" className="w-12">
                      <Checkbox
                        checked={selectedVouchers.length > 0 && selectedVouchers.length === currentVouchers.length}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVouchers.length > 0 ? (
                    currentVouchers.map((voucher) => (
                      <TableRow key={voucher.id} data-state={selectedVouchers.includes(voucher.id) && "selected"}>
                        <TableCell padding="checkbox">
                          <Checkbox
                             checked={selectedVouchers.includes(voucher.id)}
                             onCheckedChange={(checked) => handleRowSelect(voucher.id, checked as boolean)}
                             aria-label="Select row"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{voucher.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <span className={cn(
                                "h-2 w-2 rounded-full",
                                voucher.status === 'active' && 'bg-green-500',
                                voucher.status === 'purchased' && 'bg-yellow-500',
                                voucher.status === 'expired' && 'bg-red-500',
                             )}></span>
                             <span className="capitalize">{voucher.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formattedPrice(voucher.price)}</TableCell>
                        <TableCell>{voucher.expiryDate}</TableCell>
                        <TableCell><Badge variant="outline">{voucher.code}</Badge></TableCell>
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
                                      setSelectedVoucher(voucher);
                                      setIsAddEditDialogOpen(true);
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
                                  This action cannot be undone. This will permanently delete the voucher.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(voucher.id)}>
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
                      <TableCell colSpan={7} className="h-24 text-center">
                        No vouchers found for this category.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedVouchers.length} selected vouchers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>
              Yes, delete vouchers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );

  const renderPurchasedView = () => (
     <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-2">
        <div className='flex items-center gap-4'>
           <Button variant="outline" size="icon" onClick={() => setView('grid')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Purchased Vouchers</h1>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Purchased Voucher List</CardTitle>
          <CardDescription>
            A list of all vouchers that have been successfully purchased.
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
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasedVouchers.length > 0 ? (
                    purchasedVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-medium">{voucher.title}</TableCell>
                        <TableCell>{voucher.category}</TableCell>
                        <TableCell>{formattedPrice(voucher.price)}</TableCell>
                        <TableCell><Badge variant="outline">{voucher.code}</Badge></TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No vouchers have been purchased yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
       </Card>
    </div>
  );

  return (
    <>
      {view === 'grid' && renderGridView()}
      {view === 'table' && renderTableView()}
      {view === 'purchased' && renderPurchasedView()}
      
       <Dialog open={isAddEditDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedVoucher ? 'Edit Voucher' : 'Add New Voucher'}</DialogTitle>
              <DialogDescription>
                {selectedVoucher ? 'Make changes to the voucher details below.' : 'Fill out the form to create a new voucher.'}
              </DialogDescription>
            </DialogHeader>
            <VoucherForm
              key={selectedVoucher?.id || 'new'}
              initialValues={selectedVoucher ? {
                ...selectedVoucher,
                expiryDate: selectedVoucher.expiryDate
              } : undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              voucherProfiles={voucherProfiles}
            />
          </DialogContent>
        </Dialog>
      
      <ImportDialog 
        isImportOpen={isImportOpen}
        setIsImportOpen={setIsImportOpen}
        voucherProfiles={voucherProfiles}
        onImport={handleImport}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

    