
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";

export default function SubscribersPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Subscribers</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
          <CardDescription>
            Here are all the users subscribed to your notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-20 text-center">
            <h3 className="font-headline text-xl font-semibold">No Subscribers Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribers will appear here once they sign up.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
