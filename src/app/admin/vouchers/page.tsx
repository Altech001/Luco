
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function VouchersPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Vouchers</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Voucher
        </Button>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Voucher List</CardTitle>
          <CardDescription>
            Here are all the vouchers currently in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-20 text-center">
            <h3 className="font-headline text-xl font-semibold">No Vouchers Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click "Add Voucher" to create your first one.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
