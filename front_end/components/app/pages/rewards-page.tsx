"use client";

import React, { useEffect, useState } from 'react';
import type { Reward } from '@/lib/types';
import { RewardCard } from '../rewards/reward-card';

export const RewardsPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  const LIMIT = 12;

  const fetchRewards = async (cursor?: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(LIMIT));
      if (cursor) params.set('cursor', String(cursor));

      const res = await fetch(`/api/v0/reward?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data || !Array.isArray(data.rewards)) {
        throw new Error('Unexpected response from server');
      }

      // Append or replace depending on whether cursor provided
      setRewards(prev => (cursor ? [...prev, ...data.rewards] : data.rewards));
      setNextCursor(data.nextCursor ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
      <p className="text-lg text-gray-600">Use your points to claim exciting rewards!</p>

      {error && (
        <div className="text-destructive">Error loading rewards: {error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>

      <div className="pt-4 text-center">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : nextCursor ? (
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => fetchRewards(nextCursor)}
          >
            Load more
          </button>
        ) : (
          <div className="text-sm text-muted-foreground">No more rewards</div>
        )}
      </div>
    </div>
  );
};
