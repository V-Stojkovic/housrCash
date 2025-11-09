import React from 'react';
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { Gift, ShoppingCart, Award } from 'lucide-react';
import { MOCK_BALANCE, MOCK_PAYMENTS, MOCK_REDEMPTIONS, MOCK_REWARDS } from '@/lib/mock-data';
import { RewardCard } from '@/components/app/rewards/reward-card';

export const DashboardPage: React.FC = () => {
  const totalPoints = MOCK_BALANCE;
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Welcome Back!</h2>
      
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardDescription className="text-primary-foreground/80 uppercase">Total Points</CardDescription>
              <CardTitle className="text-4xl font-bold text-primary-foreground">{totalPoints.toLocaleString()}</CardTitle>
            </div>
            <Gift className="w-12 h-12 text-primary-foreground/70" />
          </div>
        </CardHeader>
      </Card>

    
    <h2 className="text-3xl font-bold text-gray-800">Favourite Rewards</h2>
    <p className="text-lg text-gray-600">See how close you are to reaching your goals!</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_REWARDS.map(reward => (
        <RewardCard key={reward.id} reward={reward} balance={MOCK_BALANCE}/>
      ))}
    </div>
   <Card>
        <CardContent className="p-4 space-y-4">
          {MOCK_PAYMENTS.slice(0, 2).map(payment => (
            <div key={payment.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-full mr-3">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{payment.merchant}</div>
                  <div className="text-sm text-muted-foreground">{payment.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">+{payment.pointsEarned} pts</div>
                <div className="text-sm text-muted-foreground">-${payment.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
          {MOCK_REDEMPTIONS.slice(0, 1).map(redemption => (
            <div key={redemption.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-full mr-3">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">{redemption.rewardTitle}</div>
                  <div className="text-sm text-muted-foreground">{redemption.date}</div>
                </div>
              </div>
              <div className="font-semibold text-destructive">-{redemption.pointsSpent} pts</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
