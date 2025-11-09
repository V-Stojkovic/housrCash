'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUserId } from '@/lib/auth';
import { toast } from 'sonner';
import { DollarSign, X } from 'lucide-react';
import apiFetch from '@/lib/api.js';



interface Transaction {
  id: number;
  userId: number | null;
  userName: string;
  amount: number;
  reference: string | null;
  timestamp: string;
  status: string;
}

interface TransactionListProps {
  groupId: number;
  onUpdate: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ groupId, onUpdate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<number | null>(null);

  const fetchTransactions = React.useCallback(async () => {
    try {
      const response = await apiFetch(`/api/v0/group/${groupId}/transactions`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCloseTransaction = async (transactionId: number) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    if (!confirm('Are you sure you want to close this transaction? This means everyone has settled their share.')) {
      return;
    }

    setClosingId(transactionId);

    try {
      const response = await apiFetch(`/api/v0/group/transaction/${transactionId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId) })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Transaction closed successfully');
        fetchTransactions();
        onUpdate();
      } else {
        toast.error('Failed to close transaction', {
          description: data.message
        });
      }
    } catch (error) {
      console.error('Error closing transaction:', error);
      toast.error('Network error');
    } finally {
      setClosingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading transactions...
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No transactions yet. Add your first group expense above!
        </CardContent>
      </Card>
    );
  }

  const currentUserId = parseInt(getCurrentUserId() || '0');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">
                    {transaction.reference || 'Group Expense'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Paid by {transaction.userName} • {formatDate(transaction.timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-lg">£{transaction.amount.toFixed(2)}</div>
                  <div className="text-xs text-green-600">Open</div>
                </div>
                {transaction.userId === currentUserId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCloseTransaction(transaction.id)}
                    disabled={closingId === transaction.id}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
