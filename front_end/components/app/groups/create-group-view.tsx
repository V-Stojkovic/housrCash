'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { getCurrentUserId } from '@/lib/auth';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';



interface CreateGroupViewProps {
  onGroupCreated: () => void;
}

export const CreateGroupView: React.FC<CreateGroupViewProps> = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      toast.error('Please log in to create a group');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v0/group/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          creatorUserId: parseInt(userId)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const code = data.data.inviteCode;
        setInviteCode(code);
        toast.success('Group created successfully!', {
          description: `Share your invite code: ${code}`
        });
        onGroupCreated();
      } else {
        toast.error('Failed to create group', {
          description: data.message || 'An error occurred'
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Network error', {
        description: 'Unable to connect to server'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (inviteCode) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-green-600">Group Created! 🎉</h3>
          <p className="text-muted-foreground">Share this code with your friends to invite them</p>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Invite Code</div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-mono font-bold tracking-wider">{inviteCode}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteCode}
              className="ml-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Your group dashboard will load automatically
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Create a New Group</h3>
        <p className="text-sm text-muted-foreground">
          Start a group to split bills and track shared expenses
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="groupName">Group Name</FieldLabel>
        <Input
          id="groupName"
          type="text"
          placeholder="e.g., Apartment 4B, Weekend Trip, Office Lunch"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={loading}
          maxLength={100}
        />
      </Field>

      <Button
        onClick={handleCreateGroup}
        disabled={loading || !groupName.trim()}
        className="w-full"
      >
        {loading ? 'Creating Group...' : 'Create Group'}
      </Button>
    </div>
  );
};
