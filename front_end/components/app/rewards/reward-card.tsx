'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reward } from '@/lib/types';
import { toast } from 'sonner';
import { getCurrentUserId } from '@/lib/auth';
import apiFetch from '@/lib/api.js';

interface RewardCardProps {
  reward: Reward;
  balance?: number;
  onRedeemSuccess?: () => void;
}



export const RewardCard: React.FC<RewardCardProps> = ({ reward, balance, onRedeemSuccess }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      toast.error('Please log in to redeem rewards');
      return;
    }

    setIsRedeeming(true);

    try {
      const response = await apiFetch(`/api/v0/redeem/${userId}/${reward.id}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Reward redeemed successfully!', {
          description: `${reward.title} - ${reward.cost} points deducted`,
        });
        
        // Call the callback to refresh balance/rewards if provided
        if (onRedeemSuccess) {
          onRedeemSuccess();
        }
      } else {
        // Handle specific error cases
        if (data.error === 'INSUFFICIENT_POINTS') {
          toast.error('Insufficient Points', {
            description: `You need ${data.shortfall} more points to redeem this reward`,
          });
        } else {
          toast.error('Redemption Failed', {
            description: data.message || 'Unable to redeem reward',
          });
        }
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Network Error', {
        description: 'Unable to connect to server. Please try again.',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader>
        <CardDescription className="text-primary font-semibold">{reward.vendor}</CardDescription>
        <CardTitle>{reward.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-lg font-bold text-foreground">
          {balance ? (Math.max(0, reward.cost - balance)).toLocaleString(): reward.cost} pts {balance ? 'to go': ''}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleRedeem}
          disabled={isRedeeming || (balance !== undefined && balance < reward.cost)}
        >
          {isRedeeming ? 'Redeeming...' : balance !== undefined && balance < reward.cost ? 'Insufficient Points' : 'Redeem Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};
