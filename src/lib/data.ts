import type { Voucher, VoucherCategory } from '@/types';
import { Sun, Calendar, CalendarDays, Star, Megaphone } from 'lucide-react';

export const vouchers: Voucher[] = [
  {
    id: 'LD001',
    title: 'Morning Coffee Boost',
    description: 'Get any regular coffee for half price.',
    category: 'Luco Day',
    discount: '50%',
    code: 'LUCODAY50',
    expiryDate: '24 Dec 2024',
    isNew: true,
  },
  {
    id: 'LW001',
    title: 'Weekly Pastry Treat',
    description: 'Buy one pastry, get one free.',
    category: 'Luco Week',
    discount: 'BOGO',
    code: 'WEEKLYPASTRY',
    expiryDate: '28 Dec 2024',
  },
  {
    id: 'LM001',
    title: 'Monthly Merchandise Discount',
    description: '20% off on all official Luco merchandise.',
    category: 'Luco Month',
    discount: '20%',
    code: 'LUCOMONTH20',
    expiryDate: '31 Jan 2025',
  },
  {
    id: 'MEM001',
    title: 'Exclusive Member Latte',
    description: 'A free signature latte for our members.',
    category: 'Member',
    discount: 'Free',
    code: 'MEMBERLATTE',
    expiryDate: '15 Jan 2025',
    isNew: true,
  },
  {
    id: 'PRO001',
    title: 'Holiday Special',
    description: '25% off your entire order.',
    category: 'Promo',
    discount: '25%',
    code: 'HOLIDAY25',
    expiryDate: '31 Dec 2024',
  },
    {
    id: 'LD002',
    title: 'Lunchtime Sandwich Deal',
    description: 'Get a free drink with any sandwich purchase.',
    category: 'Luco Day',
    discount: 'Free Drink',
    code: 'LUNCHDEAL',
    expiryDate: '24 Dec 2024',
  },
  {
    id: 'LW002',
    title: 'Weekend Brunch Offer',
    description: '15% off on the total bill for weekend brunch.',
    category: 'Luco Week',
    discount: '15%',
    code: 'WKNDBRUNCH',
    expiryDate: '29 Dec 2024',
  },
  {
    id: 'MEM002',
    title: 'Member Birthday Gift',
    description: 'A special treat on your birthday month.',
    category: 'Member',
    discount: 'Gift',
    code: 'BDAYGIFT',
    expiryDate: '31 Mar 2025',
  },
  {
    id: 'PRO002',
    title: 'New User Welcome',
    description: '30% off your first order on the app.',
    category: 'Promo',
    discount: '30%',
    code: 'WELCOME30',
    expiryDate: 'N/A',
    isNew: true,
  },
   {
    id: 'LM002',
    title: 'Coffee Bean Subscription',
    description: '10% off your first month of coffee bean subscription.',
    category: 'Luco Month',
    discount: '10%',
    code: 'BEANSUB10',
    expiryDate: '31 Jan 2025',
  },
];

export const voucherCategories: string[] = ['Luco Day', 'Luco Week', 'Luco Month', 'Member', 'Promo'];

export const voucherCategoriesData: VoucherCategory[] = [
    { name: 'Luco Day', icon: Sun },
    { name: 'Luco Week', icon: Calendar },
    { name: 'Luco Month', icon: CalendarDays },
    { name: 'Member', icon: Star },
    { name: 'Promo', icon: Megaphone },
];

export const purchaseHistory: string = "The user has previously bought multiple espresso drinks, a croissant, and a bag of whole bean coffee. They are a frequent morning visitor.";
