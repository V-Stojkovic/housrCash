"use client";
import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Payment } from '@/lib/types';

export const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/v0/payments/history/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        console.log(res.status)
        if (res.ok) {
          console.log(res.status)
          const data = await res.json();
          setPayments(data);
        } else {
          console.error('Failed to fetch payments');
        }
      } catch (error) {
        console.error('An error occurred while fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ul className="divide-y divide-border">
      {payments.map(payment => (
        <li key={payment.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-muted rounded-full mr-3">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="font-semibold">{payment.merchant}</div>
              <div className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">+{payment.pointsEarned} pts</div>
            <div className="text-sm text-muted-foreground">-${payment.amount.toFixed(2)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};
