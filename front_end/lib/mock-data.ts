import { CreditCard, Banknote } from 'lucide-react';
import { ConnectedAccount, Reward, Payment, Redemption } from './types';

export const MOCK_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
    { id: 'acc1', provider: 'Visa', lastFour: '4242', icon: CreditCard },
    { id: 'acc2', provider: 'Plaid', lastFour: '1234', icon: Banknote },
];

export const MOCK_REWARDS: Reward[] = [
    { id: 'r1', title: '$10 Starbucks Card', points: 1000, vendor: 'Starbucks', imageUrl: 'https://placehold.co/600x400/003300/FFFFFF?text=Starbucks' },
    { id: 'r2', title: '$25 Amazon Credit', points: 2500, vendor: 'Amazon', imageUrl: 'https://placehold.co/600x400/FF9900/FFFFFF?text=Amazon' },
    { id: 'r3', title: '50% off Uber Eats', points: 500, vendor: 'Uber Eats', imageUrl: 'https://placehold.co/600x400/000000/FFFFFF?text=Uber+Eats' },
    { id: 'r4', title: '$5 Dunkin\' Donuts', points: 500, vendor: 'Dunkin\'', imageUrl: 'https://placehold.co/600x400/FF69B4/FFFFFF?text=Dunkin%27' },
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 'p1', date: '2025-11-08', merchant: 'Starbucks', amount: 5.75, pointsEarned: 6 },
    { id: 'p2', date: '2025-11-07', merchant: 'Grocery Store', amount: 89.50, pointsEarned: 90 },
    { id: 'p3', date: '2025-11-07', merchant: 'Uber', amount: 22.10, pointsEarned: 22 },
    { id: 'p4', date: '2025-11-06', merchant: 'Amazon', amount: 112.00, pointsEarned: 112 },
];

export const MOCK_REDEMPTIONS: Redemption[] = [
    { id: 'rd1', date: '2025-11-05', rewardTitle: '$10 Starbucks Card', pointsSpent: 1000 },
    { id: 'rd2', date: '2025-10-28', rewardTitle: '50% off Uber Eats', pointsSpent: 500 },
];
