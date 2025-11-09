"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { PaymentList } from '@/components/app/history/payment-list';
import { RedemptionList } from '@/components/app/history/redemption-list';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'redemptions'>('payments');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">History</h2>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'payments' | 'redemptions')}>
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <PaymentList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="redemptions">
          <Card>
            <CardContent className="p-0">
              <RedemptionList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};