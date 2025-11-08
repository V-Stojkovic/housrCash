import React from 'react';
import { MOCK_PAYMENTS } from '@/lib/mock-data';
import { ShoppingCart } from 'lucide-react';

export const PaymentList: React.FC = () => {
  return (
    <ul className="divide-y divide-gray-200">
      {MOCK_PAYMENTS.map(payment => (
        <li key={payment.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold">{payment.merchant}</div>
              <div className="text-sm text-gray-500">{payment.date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">+{payment.pointsEarned} pts</div>
            <div className="text-sm text-gray-500">-${payment.amount.toFixed(2)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};
