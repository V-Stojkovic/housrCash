'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { getCurrentUserId } from '@/lib/auth';
import { toast } from 'sonner';
import apiFetch from '@/lib/api.js';



interface JoinGroupViewProps {
  onGroupJoined: () => void;
}

export const JoinGroupView: React.FC<JoinGroupViewProps> = ({ onGroupJoined }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      toast.error('Please log in to join a group');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(`/api/v0/group/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
          userId: parseInt(userId)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Successfully joined group!', {
          description: `Welcome to ${data.data.groupName}`
        });
        onGroupJoined();
      } else {
        toast.error('Failed to join group', {
          description: data.message || 'An error occurred'
        });
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Join an Existing Group</h3>
        <p className="text-sm text-muted-foreground">
          Enter the invite code shared by your group admin
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="inviteCode">Invite Code</FieldLabel>
        <Input
          id="inviteCode"
          type="text"
          placeholder="GRP-ABC123X"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          disabled={loading}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Format: GRP-[code] (e.g., GRP-1K, GRP-ABC123X)
        </p>
      </Field>

      <Button
        onClick={handleJoinGroup}
        disabled={loading || !inviteCode.trim()}
        className="w-full"
      >
        {loading ? 'Joining Group...' : 'Join Group'}
      </Button>

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> You can only be in one group at a time. If you&apos;re already in a group, you&apos;ll need to leave it first.
        </p>
      </div>
    </div>
  );
};
