import { CreditCard, Banknote } from 'lucide-react';

/** Defines the available pages in the app */
export type Page = 'dashboard' | 'connect' | 'rewards' | 'history';

/** Mock data structure for a connected payment method */
export type ConnectedAccount = {
  id: string;
  provider: string; // e.g., 'Visa', 'Plaid'
  lastFour: string;
  icon: React.ElementType;
};

/** Mock data structure for a reward item */
export type Reward =  {
  id: string;
  title: string;
  cost: number;
  imageUrl: string;
  vendor: string;
};

/** Mock data structure for a payment transaction */
export type Payment = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  pointsEarned: number;
};

/** Mock data structure for a redemption transaction */
export type Redemption = {
  id: string;
  date: string;
  rewardTitle: string;
  pointsSpent: number;
};
