
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Voucher Performance</CardTitle>
          <CardDescription>
            Insights into how your vouchers are performing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-20 text-center">
            <h3 className="font-headline text-xl font-semibold">Analytics Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back later for detailed performance metrics.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
