
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BulkManagerPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bulk Manager</h1>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>
            Manage your members and subscribers in bulk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-20 text-center">
            <h3 className="font-headline text-xl font-semibold">Bulk Management Coming Soon</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check back later for tools to manage your data in bulk.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
