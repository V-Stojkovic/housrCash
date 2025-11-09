"use client";

import React from 'react';
import { MOCK_REWARDS, MOCK_BALANCE } from '@/lib/mock-data';
import { RewardCard } from '@/components/app/rewards/reward-card';

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
      <p className="text-lg text-gray-600">Use your points to claim exciting rewards!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_REWARDS.map(reward => (
          <RewardCard key={reward.id} reward={reward} balance={MOCK_BALANCE} />
        ))}
      </div>
    </div>
  );
};