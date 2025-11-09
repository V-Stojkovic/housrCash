'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Reward {
  id: number;
  title: string;
  description: string;
  cost: number;
  image_url?: string;
  is_active: boolean;
}

interface Settings {
  cashback_rate: number;
}

export default function AdminDashboard() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [settings, setSettings] = useState<Settings>({ cashback_rate: 1.0 });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Form states for new/edit reward
  const [rewardForm, setRewardForm] = useState({
    title: '',
    description: '',
    cost: 0,
    image_url: '',
    is_active: true
  });

  // Fetch current rewards and settings
  useEffect(() => {
    console.log('=== Admin Dashboard - Loading Data ===');
    
    const loadData = async () => {
      try {
        console.log('Fetching rewards from: /api/v0/reward');
        // Fetch rewards
        const rewardsRes = await fetch('/api/v0/reward');
        console.log('Rewards response status:', rewardsRes.status);
        
        const rewardsData = await rewardsRes.json();
        console.log('Rewards data received:', rewardsData);
        
        console.log('Fetching settings from: /api/v0/settings/cashback-rate');
        // Fetch settings
        const settingsRes = await fetch('/api/v0/settings/cashback-rate');
        console.log('Settings response status:', settingsRes.status);
        
        const settingsData = await settingsRes.json();
        console.log('Settings data received:', settingsData);
        
        if (rewardsData.success) {
          // Map backend fields to frontend format
          const mappedRewards = rewardsData.data.map((r: Reward) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            cost: r.cost,
            image_url: r.image_url,
            is_active: Boolean(r.is_active)
          }));
          console.log('Mapped rewards:', mappedRewards);
          setRewards(mappedRewards);
        } else {
          console.error('Failed to fetch rewards:', rewardsData.message);
        }
        
        if (settingsData.success) {
          console.log('Setting cashback rate:', settingsData.data.cashback_rate);
          setSettings({ cashback_rate: settingsData.data.cashback_rate });
        } else {
          console.error('Failed to fetch settings:', settingsData.message);
        }
        
        setIsLoading(false);
        console.log('=== Admin Dashboard - Data Loading Complete ===');
      } catch (error) {
        console.error('=== Admin Dashboard - Loading Error ===');
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSaveCashbackRate = async () => {
    console.log('=== Save Cashback Rate - START ===');
    console.log('New cashback rate:', settings.cashback_rate);
    
    setSaveStatus('Saving...');
    try {
      console.log('Sending PUT request to: /api/v0/settings/cashback-rate');
      
      const response = await fetch('/api/v0/settings/cashback-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashback_rate: settings.cashback_rate })
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Cashback rate saved successfully!');
        setSaveStatus('Saved successfully!');
      } else {
        console.error('Save failed:', data.message);
        setSaveStatus('Error: ' + data.message);
      }
      setTimeout(() => setSaveStatus(''), 3000);
      console.log('=== Save Cashback Rate - END ===');
    } catch (error) {
      console.error('=== Save Cashback Rate - ERROR ===');
      setSaveStatus('Error saving');
      console.error('Error saving cashback rate:', error);
    }
  };

  const handleCreateReward = async () => {
    console.log('=== Create Reward - START ===');
    console.log('Form data:', rewardForm);
    
    setSaveStatus('Creating...');
    try {
      console.log('Sending POST request to: /api/v0/reward');
      console.log('Request body:', JSON.stringify(rewardForm, null, 2));
      
      const response = await fetch('/api/v0/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardForm)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Reward created successfully!');
        console.log('New reward data:', data.data);
        
        // Add the new reward to state
        const newReward = {
          ...data.data,
          is_active: Boolean(data.data.is_active)
        };
        console.log('Adding to state:', newReward);
        
        setRewards([...rewards, newReward]);
        
        // Reset form
        console.log('Resetting form...');
        setRewardForm({ title: '', description: '', cost: 0, image_url: '', is_active: true });
        setSaveStatus('Reward created!');
      } else {
        console.error('Create reward failed:', data.message);
        setSaveStatus('Error: ' + data.message);
      }
      setTimeout(() => setSaveStatus(''), 3000);
      console.log('=== Create Reward - END ===');
    } catch (error) {
      console.error('=== Create Reward - ERROR ===');
      setSaveStatus('Error creating reward');
      console.error('Error creating reward:', error);
    }
  };

  const handleUpdateReward = async (reward: Reward) => {
    console.log('=== Update Reward - START ===');
    console.log('Updating reward ID:', reward.id);
    console.log('Update data:', reward);
    
    setSaveStatus('Updating...');
    try {
      const updateData = {
        title: reward.title,
        description: reward.description,
        cost: reward.cost,
        image_url: reward.image_url,
        is_active: reward.is_active
      };
      
      console.log('Sending PUT request to:', `/api/v0/reward/${reward.id}`);
      console.log('Request body:', updateData);
      
      const response = await fetch(`/api/v0/reward/${reward.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Reward updated successfully!');
        
        // Update local state
        const updatedReward = {
          ...data.data,
          is_active: Boolean(data.data.is_active)
        };
        console.log('Updating state with:', updatedReward);
        
        setRewards(rewards.map(r => r.id === reward.id ? updatedReward : r));
        setSaveStatus('Reward updated!');
      } else {
        console.error('Update failed:', data.message);
        setSaveStatus('Error: ' + data.message);
      }
      setTimeout(() => setSaveStatus(''), 3000);
      console.log('=== Update Reward - END ===');
    } catch (error) {
      console.error('=== Update Reward - ERROR ===');
      setSaveStatus('Error updating reward');
      console.error('Error updating reward:', error);
    }
  };

  const toggleRewardActive = async (reward: Reward) => {
    console.log('=== Toggle Reward Active - START ===');
    console.log('Toggling reward ID:', reward.id);
    console.log('Current is_active:', reward.is_active);
    console.log('New is_active:', !reward.is_active);
    
    const updated = { ...reward, is_active: !reward.is_active };
    await handleUpdateReward(updated);
    
    console.log('=== Toggle Reward Active - END ===');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage rewards and cashback settings</p>
          </div>
          {saveStatus && (
            <div className="px-4 py-2 rounded-md bg-primary/10 text-primary">
              {saveStatus}
            </div>
          )}
        </div>

        <Tabs defaultValue="rewards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rewards">Rewards Management</TabsTrigger>
            <TabsTrigger value="settings">Cashback Settings</TabsTrigger>
          </TabsList>

          {/* Rewards Management Tab */}
          <TabsContent value="rewards" className="space-y-6">
            {/* Create New Reward */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Reward</CardTitle>
                <CardDescription>Add a new reward for users to redeem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <input
                      type="text"
                      value={rewardForm.title}
                      onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                      placeholder="e.g., $5 Amazon Gift Card"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Points Required</label>
                    <input
                      type="number"
                      value={rewardForm.cost}
                      onChange={(e) => setRewardForm({ ...rewardForm, cost: Number(e.target.value) })}
                      placeholder="500"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <input
                      type="text"
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      placeholder="Brief description"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Image URL (optional)</label>
                    <input
                      type="text"
                      value={rewardForm.image_url}
                      onChange={(e) => setRewardForm({ ...rewardForm, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={rewardForm.is_active}
                      onChange={(e) => setRewardForm({ ...rewardForm, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                      Active (visible to users)
                    </label>
                  </div>
                </div>

                <Button onClick={handleCreateReward} className="mt-4">
                  Create Reward
                </Button>
              </CardContent>
            </Card>

            {/* Existing Rewards List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Rewards</CardTitle>
                <CardDescription>Manage active and inactive rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewards.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No rewards yet. Create one above!</p>
                  ) : (
                    rewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{reward.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              reward.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reward.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          <p className="text-sm font-medium text-primary mt-1">{reward.cost} points</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRewardActive(reward)}
                          >
                            {reward.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cashback Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cashback Rate</CardTitle>
                <CardDescription>
                  Set the percentage of rent that converts to cashback points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Cashback Rate (%)
                    </label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={settings.cashback_rate}
                        onChange={(e) => setSettings({ ...settings, cashback_rate: Number(e.target.value) })}
                        className="w-32 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      />
                      <span className="text-sm text-muted-foreground">
                        For every $100 rent paid, users earn ${settings.cashback_rate.toFixed(2)} in points
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Examples:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• $1,000 rent → {(settings.cashback_rate * 10).toFixed(2)} points</li>
                      <li>• $1,500 rent → {(settings.cashback_rate * 15).toFixed(2)} points</li>
                      <li>• $2,000 rent → {(settings.cashback_rate * 20).toFixed(2)} points</li>
                    </ul>
                  </div>

                  <Button onClick={handleSaveCashbackRate}>
                    Save Cashback Rate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
