'use client';
import apiFetch from '@/lib/api.js';


import React, { useState, useEffect, useCallback } from 'react';
import { Award } from 'lucide-react';
import { getCurrentUserId } from '@/lib/auth';
import { Button } from '@/components/ui/button';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

interface Redemption {
  id: number;
  rewardId: number;
  timestamp: string;
  reward: {
    title: string;
    description: string;
    cost: number;
    imageUrl: string | null;
  };
}

export const RedemptionList: React.FC = () => {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const getDateRange = (filter: DateFilter): { start?: string; end?: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today.toISOString() };
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo.toISOString() };
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo.toISOString() };
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return { start: yearAgo.toISOString() };
      case 'all':
      default:
        return {};
    }
  };

  const fetchRedemptions = useCallback(async () => {
    const userId = getCurrentUserId();
    
    if (!userId) {
      setError('Please log in to view redemption history');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateRange = getDateRange(dateFilter);
      const params = new URLSearchParams();
      
      if (dateRange.start) params.append('start', dateRange.start);
      if (dateRange.end) params.append('end', dateRange.end);

      const queryString = params.toString();
      const url = `/api/v0/redeem/history/${userId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch redemption history');
      }

      const data = await response.json();

      if (data.success) {
        setRedemptions(data.data.redemptions);
      } else {
        throw new Error(data.message || 'Failed to fetch redemptions');
      }
    } catch (err) {
      console.error('Error fetching redemptions:', err);
      setError('Unable to load redemption history');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading redemption history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Date Filter Buttons */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={dateFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('all')}
          >
            All Time
          </Button>
          <Button
            variant={dateFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('today')}
          >
            Today
          </Button>
          <Button
            variant={dateFilter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('week')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={dateFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('month')}
          >
            Last Month
          </Button>
          <Button
            variant={dateFilter === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('year')}
          >
            Last Year
          </Button>
        </div>
      </div>

      {/* Redemption List */}
      {redemptions.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No redemptions found for this time period
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {redemptions.map(redemption => (
            <li key={redemption.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-full mr-3">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">{redemption.reward.title}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(redemption.timestamp)}</div>
                </div>
              </div>
              <div className="font-semibold text-destructive">-{redemption.reward.cost.toLocaleString()} pts</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
