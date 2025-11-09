'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUserId } from '@/lib/auth';
import { CreateGroupView } from '@/components/app/groups/create-group-view';
import { JoinGroupView } from '@/components/app/groups/join-group-view';
import { GroupDashboard } from '@/components/app/groups/group-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function GroupsPage() {
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  const fetchGroupData = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/v0/group/user/${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setGroupData(data.data);
      } else {
        setGroupData(null);
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setGroupData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  const handleGroupJoined = () => {
    fetchGroupData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If user is in a group, show the group dashboard
  if (groupData) {
    return <GroupDashboard groupData={groupData} onUpdate={fetchGroupData} />;
  }

  // If user is not in a group, show create/join options
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Groups</h2>
        <p className="text-lg text-muted-foreground mt-2">
          Create or join a group to split expenses with friends and housemates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'join')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Group</TabsTrigger>
          <TabsTrigger value="join">Join Group</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardContent className="pt-6">
              <CreateGroupView onGroupCreated={handleGroupJoined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join">
          <Card>
            <CardContent className="pt-6">
              <JoinGroupView onGroupJoined={handleGroupJoined} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
