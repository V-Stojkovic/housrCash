import React from 'react';
import { MOCK_REWARDS } from '@/lib/mock-data';
import { RewardCard } from '../rewards/reward-card';

export const RewardsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
      <p className="text-lg text-gray-600">Use your points to claim exciting rewards!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_REWARDS.map(reward => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
};
