import React from 'react';
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { Gift, ShoppingCart, Award } from 'lucide-react';
import { MOCK_PAYMENTS, MOCK_REDEMPTIONS } from '@/lib/mock-data';

export const DashboardPage: React.FC = () => {
  const totalPoints = MOCK_PAYMENTS.reduce((sum, p) => sum + p.pointsEarned, 0) - MOCK_REDEMPTIONS.reduce((sum, r) => sum + r.pointsSpent, 0);
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
      
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardDescription className="text-indigo-100 uppercase">Total Points</CardDescription>
              <CardTitle className="text-4xl font-bold text-white">{totalPoints.toLocaleString()}</CardTitle>
            </div>
            <Gift className="w-12 h-12 text-indigo-300" />
          </div>
        </CardHeader>
      </Card>

      <h3 className="text-2xl font-semibold text-gray-700">Recent Activity</h3>
      <Card>
        <CardContent className="p-4 space-y-4">
          {MOCK_PAYMENTS.slice(0, 2).map(payment => (
            <div key={payment.id} className="flex items-center justify-between">
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
            </div>
          ))}
          {MOCK_REDEMPTIONS.slice(0, 1).map(redemption => (
            <div key={redemption.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">{redemption.rewardTitle}</div>
                  <div className="text-sm text-gray-500">{redemption.date}</div>
                </div>
              </div>
              <div className="font-semibold text-red-600">-{redemption.pointsSpent} pts</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
