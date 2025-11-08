import React from 'react';
import { Card, CardTitle, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reward } from '@/lib/types';

interface RewardCardProps {
  reward: Reward;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward }) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      <img 
        src={reward.imageUrl} 
        alt={reward.title} 
        className="w-full h-40 object-cover"
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/cccccc/FFFFFF?text=Image+Error')}
      />
      <CardHeader>
        <CardDescription className="text-indigo-600 font-semibold">{reward.vendor}</CardDescription>
        <CardTitle>{reward.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-lg font-bold text-gray-700">{reward.points.toLocaleString()} pts</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Redeem Now</Button>
      </CardFooter>
    </Card>
  );
};
