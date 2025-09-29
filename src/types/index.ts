import type { LucideIcon } from "lucide-react";

export type VoucherCategoryName = 'Luco Day' | 'Luco Week' | 'Luco Month' | 'Member' | 'Promo';

export type Voucher = {
  id: string;
  title: string;
  description: string;
  category: VoucherCategoryName;
  discount: string;
  code: string;
  expiryDate: string;
  isNew?: boolean;
};

export type VoucherCategory = {
    name: 'All' | VoucherCategoryName;
    icon: LucideIcon;
};
