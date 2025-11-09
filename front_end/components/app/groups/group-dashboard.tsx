'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, TrendingUp, TrendingDown, LogOut, Copy, Check } from 'lucide-react';
import { AddTransactionForm } from './add-transaction-form';
import { TransactionList } from './transaction-list';
import { DebtBreakdown } from './debt-breakdown';
import { getCurrentUserId } from '@/lib/auth';
import { generateInviteCode } from '@/lib/invite-code';
import { toast } from 'sonner';



interface GroupData {
  group: {
    id: number;
    name: string;
    balance: number;
    memberCount: number;
  };
  userStats: {
    totalOwed: number;
    totalOwes: number;
    group_spend: number;
    group_debt: number;
  };
  members: Array<{
    id: number;
    firstName: string;
    group_spend: number;
    group_debt: number;
  }>;
}

interface GroupDashboardProps {
  groupData: GroupData;
  onUpdate: () => void;
}

export const GroupDashboard: React.FC<GroupDashboardProps> = ({ groupData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'debts'>('overview');
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const inviteCode = generateInviteCode(groupData.group.id);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveGroup = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    if (groupData.userStats.group_debt > 0) {
      toast.error('Cannot leave group', {
        description: `You have £${groupData.userStats.group_debt.toFixed(2)} in outstanding debt`
      });
      return;
    }

    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setLeaving(true);

    try {
      const response = await fetch(`/api/v0/group/leave/${userId}`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Left group successfully');
        onUpdate();
      } else {
        toast.error('Failed to leave group', {
          description: data.message
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Network error');
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{groupData.group.name}</h2>
          <p className="text-muted-foreground mt-1">
            {groupData.group.memberCount} member{groupData.group.memberCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={copyInviteCode} className="w-full sm:w-auto">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {inviteCode}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Group Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{groupData.group.balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">You Are Owed</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{groupData.userStats.totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From group members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              £{groupData.userStats.totalOwes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">To group members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupData.group.memberCount}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'transactions' | 'debts')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Transaction</CardTitle>
              <CardDescription>
                Record a group expense - it will be split equally among all members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddTransactionForm groupId={groupData.group.id} onSuccess={onUpdate} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {groupData.members.map((member) => (
                  <li key={member.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{member.firstName}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.id === parseInt(getCurrentUserId() || '0') && '(You)'}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-green-600">Owed: £{member.group_spend.toFixed(2)}</div>
                      <div className="text-red-600">Owes: £{member.group_debt.toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList groupId={groupData.group.id} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="debts">
          <DebtBreakdown />
        </TabsContent>
      </Tabs>

      {/* Leave Group Button */}
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            onClick={handleLeaveGroup}
            disabled={leaving}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {leaving ? 'Leaving...' : 'Leave Group'}
          </Button>
          {groupData.userStats.group_debt > 0 && (
            <p className="text-sm text-red-600 mt-2 text-center">
              You must settle your debt of £{groupData.userStats.group_debt.toFixed(2)} before leaving
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
