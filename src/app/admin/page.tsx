
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <Card className="mt-8">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><LayoutDashboard /> Welcome, Albertine!</CardTitle>
              <CardDescription>Here's an overview of your voucher platform.</CardDescription>
          </CardHeader>
          <CardContent>
              <p>You can manage users, view analytics, and configure settings from the sidebar.</p>
              <p className="mt-4 text-sm text-muted-foreground">More dashboard widgets and stats coming soon!</p>
          </CardContent>
      </Card>
    </>
  );
}
