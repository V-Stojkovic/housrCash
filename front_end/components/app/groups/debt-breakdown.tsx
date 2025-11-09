'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUserId } from '@/lib/auth';
import { TrendingUp, TrendingDown, Check } from 'lucide-react';
import { toast } from 'sonner';



interface Debt {
  transactionId: number;
  creditorId: number | null;
  creditorName: string;
  amount: number;
  reference: string | null;
  timestamp: string;
  markedPaid: boolean;
  markedAt: string | null;
}

interface Credit {
  transactionId: number;
  debtorId: number;
  debtorName: string;
  amount: number;
  reference: string | null;
  timestamp: string;
  status: string;
}

export const DebtBreakdown: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwes, setTotalOwes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);

  const fetchData = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      // Fetch what user owes
      const debtsResponse = await fetch(`/api/v0/group/user/${userId}/owes`);
      const debtsData = await debtsResponse.json();

      if (debtsData.success) {
        setDebts(debtsData.data.debts);
        setTotalOwes(debtsData.data.totalOwed);
      }

      // Fetch what user is owed
      const creditsResponse = await fetch(`/api/v0/group/user/${userId}/owed`);
      const creditsData = await creditsResponse.json();

      if (creditsData.success) {
        setCredits(creditsData.data.credits);
        setTotalOwed(creditsData.data.totalOwed);
      }
    } catch (error) {
      console.error('Error fetching debt breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePaid = async (transactionId: number, currentStatus: boolean) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    setUpdatingPayment(transactionId);

    try {
      const response = await fetch(`/api/v0/group/transaction/${transactionId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          paid: !currentStatus
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(!currentStatus ? 'Marked as paid ✓' : 'Unmarked as paid');
        // Refresh the data
        await fetchData();
      } else {
        toast.error('Failed to update payment status', {
          description: data.message
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Network error');
    } finally {
      setUpdatingPayment(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading debt breakdown...
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="owe" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="owe">
          <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
          You Owe (£{totalOwes.toFixed(2)})
        </TabsTrigger>
        <TabsTrigger value="owed">
          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
          You&apos;re Owed (£{totalOwed.toFixed(2)})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="owe">
        <Card>
          <CardHeader>
            <CardTitle>What You Owe</CardTitle>
          </CardHeader>
          <CardContent>
            {debts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                You don&apos;t owe anything! 🎉
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {debts.map((debt, index) => (
                  <li key={`${debt.transactionId}-${index}`} className="py-3">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleTogglePaid(debt.transactionId, debt.markedPaid)}
                        disabled={updatingPayment === debt.transactionId}
                        className={`mt-1 flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                          debt.markedPaid
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 hover:border-green-500'
                        } ${updatingPayment === debt.transactionId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {debt.markedPaid && <Check className="w-3 h-3 text-white" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 flex justify-between items-start">
                        <div className={debt.markedPaid ? 'opacity-60' : ''}>
                          <div className="font-medium">
                            {debt.creditorName}
                            {debt.markedPaid && (
                              <span className="ml-2 text-xs text-green-600 font-normal">
                                (marked paid)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {debt.reference || 'Group expense'} • {formatDate(debt.timestamp)}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${debt.markedPaid ? 'text-gray-400 line-through' : 'text-red-600'}`}>
                          £{debt.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {debts.length > 0 && (
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="font-semibold">Total You Owe</div>
                <div className="text-xl font-bold text-red-600">
                  £{totalOwes.toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="owed">
        <Card>
          <CardHeader>
            <CardTitle>What You&apos;re Owed</CardTitle>
          </CardHeader>
          <CardContent>
            {credits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No one owes you money right now
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {credits.map((credit, index) => (
                  <li key={`${credit.transactionId}-${credit.debtorId}-${index}`} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{credit.debtorName}</div>
                      <div className="text-sm text-muted-foreground">
                        {credit.reference || 'Group expense'} • {formatDate(credit.timestamp)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      £{credit.amount.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {credits.length > 0 && (
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="font-semibold">Total You&apos;re Owed</div>
                <div className="text-xl font-bold text-green-600">
                  £{totalOwed.toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
