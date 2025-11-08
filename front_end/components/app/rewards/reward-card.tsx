import React from 'react';
import { Card, CardTitle, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reward } from '@/lib/types';

interface RewardCardProps {
  reward: Reward;
  balance?: number;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, balance }) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      <img 
        src={reward.imageUrl} 
        alt={reward.title} 
        className="w-full h-40 object-cover"
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/cccccc/FFFFFF?text=Image+Error')}
      />
      <CardHeader>
        <CardDescription className="text-primary font-semibold">{reward.vendor}</CardDescription>
        <CardTitle>{reward.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-lg font-bold text-foreground">{balance ? (Math.max(0, reward.points - balance)).toLocaleString(): reward.points.toLocaleString()} pts {balance ? 'to go': ''}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Redeem Now</Button>
      </CardFooter>
    </Card>
  );
};
