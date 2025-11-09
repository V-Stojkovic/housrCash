"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

type Payment = {
  id?: number | string;
  merchant?: string;
  date?: string;
  pointsEarned?: number;
  amount?: number;
  reference?: string;
  timestamp?: string;
};

export const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPayments() {
      try {
        const res = await fetch('http://localhost:4000/api/v0/payment/get');
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();

        // Support a few common shapes: array, { payments: [] }, { data: [] }
        let items: any[] = [];
        if (Array.isArray(data)) items = data;
        else if (Array.isArray(data.payments)) items = data.payments;
        else if (Array.isArray(data.data)) items = data.data;
        else if (Array.isArray(data.results)) items = data.results;
        else if (data && typeof data === 'object') items = [data];

        const normalized: Payment[] = items.map((p: any, idx: number) => {
          const amount = typeof p.amount === 'number' ? p.amount : (p.amount ? parseFloat(p.amount) : 0);
          return {
            id: p.id ?? p.paymentId ?? idx,
            merchant: p.merchant ?? p.reference ?? p.description ?? `Payment ${p.id ?? idx}`,
            date: p.date ?? p.timestamp ?? p.created_at ?? '',
            amount,
            pointsEarned: p.pointsEarned ?? p.points ?? Math.round(amount)
          };
        });

        if (mounted) setPayments(normalized);
      } catch (err: any) {
        console.error('Failed to load payments', err);
        if (mounted) setError(err?.message ?? 'Failed to load payments');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPayments();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-4">Loading payments...</div>;
  if (error) return <div className="p-4 text-red-600">Unable to load history: {error}</div>;

  return (
    <ul className="divide-y divide-border">
      {payments.map(payment => (
        <li key={String(payment.id)} className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-muted rounded-full mr-3">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-semibold">{payment.reference ?? '-'}</div>
              <div className="text-sm text-muted-foreground">{payment.date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">+{payment.pointsEarned ?? '-'} pts</div>
            <div className="text-sm text-muted-foreground">-${(payment.amount ?? 0).toFixed(2)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};
