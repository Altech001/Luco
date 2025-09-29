
import type { LucideIcon, LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type VoucherCategoryName = 'Luco Day' | 'Luco Week' | 'Luco Month' | 'Member' | 'Promo';

export type Voucher = {
  id: string;
  title: string;
  description: string;
  category: VoucherCategoryName;
  discount: string;
  code: string;
  expiryDate: string;
  price: number;
  isNew?: boolean;
};

export type VoucherCategory = {
    name: 'All' | VoucherCategoryName;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

export type Banner = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
};

export type Subscriber = {
  id: string;
  phone: string;
  subscribedAt: Date;
};
