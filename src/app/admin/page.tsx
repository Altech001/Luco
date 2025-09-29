
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket, Users, Bell, DollarSign, LoaderCircle } from 'lucide-react';
import { getVouchers } from '@/lib/vouchers';
import { getMembers } from '@/lib/members';
import { getSubscribers } from '@/lib/subscribers';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    vouchers: 0,
    members: 0,
    subscribers: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [vouchersData, membersData, subscribersData] = await Promise.all([
          getVouchers(true), // include all statuses for revenue calc
          getMembers(),
          getSubscribers(),
        ]);

        const totalRevenue = vouchersData
          .filter(v => v.status === 'purchased')
          .reduce((acc, v) => acc + v.price, 0);

        setStats({
          vouchers: vouchersData.length,
          members: membersData.length,
          subscribers: subscribersData.length,
          revenue: totalRevenue,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);
  
  const formattedPrice = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(price);


  const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="h-8 w-24">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
            </div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formattedPrice(stats.revenue)} icon={DollarSign} isLoading={isLoading} />
        <StatCard title="Total Vouchers" value={stats.vouchers} icon={Ticket} isLoading={isLoading} />
        <StatCard title="Members" value={stats.members} icon={Users} isLoading={isLoading} />
        <StatCard title="Subscribers" value={stats.subscribers} icon={Bell} isLoading={isLoading} />
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Welcome, Albertine!</CardTitle>
                <CardDescription>Here's an overview of your voucher platform.</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">You can manage users, view analytics, and configure settings from the sidebar.</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A summary of recent sales and sign-ups.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-10 text-center">
                    <h3 className="font-headline text-lg font-semibold">Activity Feed Coming Soon</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                    Check back later for real-time updates.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
