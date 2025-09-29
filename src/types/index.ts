
import type { LucideIcon, LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type VoucherCategoryName = 'Luco Day' | 'Luco Week' | 'Luco Month' | 'Member' | 'Promo' | string;
export type VoucherStatus = 'active' | 'purchased' | 'expired';

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
  status: VoucherStatus;
  purchasedBy?: string;
  purchasedAt?: Date;
};

export type VoucherProfile = {
  id: string;
  name: string;
  title: string;
  description: string;
  category: VoucherCategoryName;
  price: number;
  discount: string;
};

export type NewVoucherProfileData = Omit<VoucherProfile, 'id'>;

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

export type Member = {
  id: string;
  username: string;
  phone: string;
  password?: string;
  subscriptionAmount: number;
  joinedAt: Date;
};

export type NewMember = Omit<Member, 'id' | 'joinedAt'>;
