'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { getCurrentUserId } from '@/lib/auth';
import { toast } from 'sonner';



interface AddTransactionFormProps {
  groupId: number;
  onSuccess: () => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ groupId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      toast.error('Please log in');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v0/group/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          groupId,
          amount: amountNum,
          reference: reference.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Transaction added!', {
          description: `$${amountNum.toFixed(2)} split among ${data.data.splitAmong} members`
        });
        setAmount('');
        setReference('');
        onSuccess();
      } else {
        toast.error('Failed to add transaction', {
          description: data.message
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="amount">Amount ($)</FieldLabel>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="reference">Description</FieldLabel>
          <Input
            id="reference"
            type="text"
            placeholder="e.g., Groceries, Dinner, Utilities"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            disabled={loading}
            maxLength={255}
          />
        </Field>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adding Transaction...' : 'Add Transaction'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        The amount will be split equally among all group members except you
      </p>
    </form>
  );
};
