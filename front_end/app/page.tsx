"use client";

import React, { useState, useMemo, createContext, useContext } from 'react';

import { Button } from '@/components/ui/button';
// --- ICONS ---
// We'll use lucide-react for icons.
import { 
    LayoutDashboard, 
    CreditCard, 
    Gift, 
    History,
    Banknote,
    ArrowRight,
    CheckCircle,
    Plus,
    Calendar,
    ShoppingCart,
    Award
} from 'lucide-react';

// --- TYPESCRIPT INTERFACES ---

/** Defines the available pages in the app */
type Page = 'dashboard' | 'connect' | 'rewards' | 'history';

/** Mock data structure for a connected payment method */
type ConnectedAccount = {
  id: string;
  provider: string; // e.g., 'Visa', 'Plaid'
  lastFour: string;
  icon: React.ElementType;
};

/** Mock data structure for a reward item */
type Reward = {
  id: string;
  title: string;
  points: number;
  imageUrl: string;
  vendor: string;
};

/** Mock data structure for a payment transaction */
type Payment = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  pointsEarned: number;
};

/** Mock data structure for a redemption transaction */
type Redemption = {
  id: string;
  date: string;
  rewardTitle: string;
  pointsSpent: number;
};

// --- MOCK DATA ---

const MOCK_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  { id: 'acc1', provider: 'Visa', lastFour: '4242', icon: CreditCard },
  { id: 'acc2', provider: 'Plaid', lastFour: '1234', icon: Banknote },
];

const MOCK_REWARDS: Reward[] = [
  { id: 'r1', title: '$10 Starbucks Card', points: 1000, vendor: 'Starbucks', imageUrl: 'https://placehold.co/600x400/003300/FFFFFF?text=Starbucks' },
  { id: 'r2', title: '$25 Amazon Credit', points: 2500, vendor: 'Amazon', imageUrl: 'https://placehold.co/600x400/FF9900/FFFFFF?text=Amazon' },
  { id: 'r3', title: '50% off Uber Eats', points: 500, vendor: 'Uber Eats', imageUrl: 'https://placehold.co/600x400/000000/FFFFFF?text=Uber+Eats' },
  { id: 'r4', title: '$5 Dunkin\' Donuts', points: 500, vendor: 'Dunkin\'', imageUrl: 'https://placehold.co/600x400/FF69B4/FFFFFF?text=Dunkin%27' },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', date: '2025-11-08', merchant: 'Starbucks', amount: 5.75, pointsEarned: 6 },
  { id: 'p2', date: '2025-11-07', merchant: 'Grocery Store', amount: 89.50, pointsEarned: 90 },
  { id: 'p3', date: '2025-11-07', merchant: 'Uber', amount: 22.10, pointsEarned: 22 },
  { id: 'p4', date: '2025-11-06', merchant: 'Amazon', amount: 112.00, pointsEarned: 112 },
];

const MOCK_REDEMPTIONS: Redemption[] = [
  { id: 'rd1', date: '2025-11-05', rewardTitle: '$10 Starbucks Card', pointsSpent: 1000 },
  { id: 'rd2', date: '2025-10-28', rewardTitle: '50% off Uber Eats', pointsSpent: 500 },
];

// --- SHADCN/UI STYLED COMPONENT STUBS ---
// In a real project, these would be imported from files
// created by the shadcn/ui CLI (e.g., '@/components/ui/button')

/**
 * Card Components (Mimic shadcn/ui)
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border bg-white text-gray-950 shadow-sm ${className}`}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-sm text-gray-500 ${className}`} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

/**
 * Tabs Components (Mimic shadcn/ui)
 */
type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};
const TabsContext = createContext<TabsContextType | null>(null);

const Tabs: React.FC<{ value: string; onValueChange: (value: string) => void; children: React.ReactNode; className?: string }> = 
  ({ value, onValueChange, children, className = '' }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = 
  ({ children, className = '' }) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    >
      {children}
    </div>
  );
};

const TabsTrigger: React.FC<{ value: string; children: React.ReactNode; className?: string }> = 
  ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within a Tabs component');

  const isActive = context.value === value;
  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-white text-gray-950 shadow-sm' : ''}
        ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<{ value: string; children: React.ReactNode; className?: string }> = 
  ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within a Tabs component');
  
  return context.value === value ? (
    <div className={`mt-2 ${className}`}>{children}</div>
  ) : null;
};


// --- NAVIGATION COMPONENTS ---

interface NavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems = [
  { page: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { page: 'connect' as Page, label: 'Connect Payments', icon: CreditCard },
  { page: 'rewards' as Page, label: 'Redeem Rewards', icon: Gift },
  { page: 'history' as Page, label: 'History', icon: History },
];

/**
 * Desktop Sidebar Navigation
 */
const Sidebar: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RewardsPay</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col py-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.page}
              item={item}
              isActive={currentPage === item.page}
              onClick={() => setCurrentPage(item.page)}
              isMobile={false}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
};

/**
 * Mobile Bottom Navigation
 */
const BottomNav: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-gray-200 z-50">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.page}
            item={item}
            isActive={currentPage === item.page}
            onClick={() => setCurrentPage(item.page)}
            isMobile={true}
          />
        ))}
      </ul>
    </nav>
  );
};

/**
 * Individual Navigation Item (for Sidebar and BottomNav)
 */
interface NavItemProps {
  item: { page: Page; label: string; icon: React.ElementType };
  isActive: boolean;
  onClick: () => void;
  isMobile: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick, isMobile }) => {
  const Icon = item.icon;
  
  // Mimic shadcn/ui button variants
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors";
  const activeClasses = isActive 
    ? (isMobile ? 'text-indigo-600' : 'bg-gray-900 text-white')
    : (isMobile ? 'text-gray-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900');
  
  const layoutClasses = isMobile 
    ? 'flex-col p-2 h-16 w-full' 
    : 'px-4 py-2 mx-2 justify-start';

  return (
    <li>
      <a
        href={`#${item.page}`}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`flex ${baseClasses} ${activeClasses} ${layoutClasses}`}
      >
        <Icon className={isMobile ? 'w-6 h-6' : 'w-5 h-5 mr-3'} />
        <span className={isMobile ? 'text-xs font-medium mt-1' : 'font-medium'}>
          {isMobile ? item.label.split(' ')[0] : item.label}
        </span>
      </a>
    </li>
  );
};

// --- PAGE COMPONENTS ---

/**
 * Dashboard Page: Shows point summary and quick actions
 */
const DashboardPage: React.FC = () => {
  const totalPoints = MOCK_PAYMENTS.reduce((sum, p) => sum + p.pointsEarned, 0) - MOCK_REDEMPTIONS.reduce((sum, r) => sum + r.pointsSpent, 0);
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
      
      {/* Points Summary Card */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardDescription className="text-indigo-100 uppercase">Total Points</CardDescription>
              <CardTitle className="text-4xl font-bold text-white">{totalPoints.toLocaleString()}</CardTitle>
            </div>
            <Gift className="w-12 h-12 text-indigo-300" />
          </div>
        </CardHeader>
      </Card>

      {/* Recent Activity */}
      <h3 className="text-2xl font-semibold text-gray-700">Recent Activity</h3>
      <Card>
        <CardContent className="p-4 space-y-4">
          {MOCK_PAYMENTS.slice(0, 2).map(payment => (
            <div key={payment.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">{payment.merchant}</div>
                  <div className="text-sm text-gray-500">{payment.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">+{payment.pointsEarned} pts</div>
                <div className="text-sm text-gray-500">-${payment.amount.toFixed(2)}</div>
              </div>
            </div>
          ))}
          {MOCK_REDEMPTIONS.slice(0, 1).map(redemption => (
            <div key={redemption.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">{redemption.rewardTitle}</div>
                  <div className="text-sm text-gray-500">{redemption.date}</div>
                </div>
              </div>
              <div className="font-semibold text-red-600">-{redemption.pointsSpent} pts</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Connect Payments Page: Shows options to link accounts
 */
const ConnectPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Connect Your Payments</h2>
      <p className="text-lg text-gray-600">Link your accounts to earn points automatically every time you spend.</p>

      {/* Connection Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="items-center text-center">
            <Banknote className="w-12 h-12 text-indigo-600 mb-4" />
            <CardTitle>Connect Bank Account</CardTitle>
            <CardDescription>Securely link via Plaid to track purchases.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Connect with Plaid</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="items-center text-center">
            <CreditCard className="w-12 h-12 text-indigo-600 mb-4" />
            <CardTitle>Link Credit/Debit Card</CardTitle>
            <CardDescription>Manually add card details to start earning.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="secondary" className="w-full">Add Card Manually</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Connected Accounts List */}
      <h3 className="text-2xl font-semibold text-gray-700 pt-6">Connected Accounts</h3>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {MOCK_CONNECTED_ACCOUNTS.map(account => (
              <li key={account.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <account.icon className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <div className="font-semibold">{account.provider}</div>
                    <div className="text-sm text-gray-500">**** **** **** {account.lastFour}</div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </li>
            ))}
            <li className="p-4">
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="w-5 h-5 mr-2" />
                Link Another Account
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Redeem Rewards Page: Shows a grid of available rewards
 */
const RewardsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
      <p className="text-lg text-gray-600">Use your points to claim exciting rewards!</p>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_REWARDS.map(reward => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
};

/**
 * Single Reward Card Component (using shadcn/ui Card)
 */
interface RewardCardProps {
  reward: Reward;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward }) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      <img 
        src={reward.imageUrl} 
        alt={reward.title} 
        className="w-full h-40 object-cover"
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/cccccc/FFFFFF?text=Image+Error')}
      />
      <CardHeader>
        <CardDescription className="text-indigo-600 font-semibold">{reward.vendor}</CardDescription>
        <CardTitle>{reward.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-lg font-bold text-gray-700">{reward.points.toLocaleString()} pts</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Redeem Now</Button>
      </CardFooter>
    </Card>
  );
};

/**
 * History Page: Shows tabs for payment and redemption history
 */
const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'redemptions'>('payments');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">History</h2>
      
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>
        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <PaymentList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="redemptions">
          <Card>
            <CardContent className="p-0">
              <RedemptionList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * List of Payment Transactions
 */
const PaymentList: React.FC = () => {
  return (
    <ul className="divide-y divide-gray-200">
      {MOCK_PAYMENTS.map(payment => (
        <li key={payment.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold">{payment.merchant}</div>
              <div className="text-sm text-gray-500">{payment.date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">+{payment.pointsEarned} pts</div>
            <div className="text-sm text-gray-500">-${payment.amount.toFixed(2)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

/**
 * List of Redemption Transactions
 */
const RedemptionList: React.FC = () => {
  return (
    <ul className="divide-y divide-gray-200">
      {MOCK_REDEMPTIONS.map(redemption => (
        <li key={redemption.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold">{redemption.rewardTitle}</div>
              <div className="text-sm text-gray-500">{redemption.date}</div>
            </div>
          </div>
          <div className="font-semibold text-red-600">-{redemption.pointsSpent.toLocaleString()} pts</div>
        </li>
      ))}
    </ul>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Memoize the page component to prevent re-rendering of all pages
  const CurrentPageComponent = useMemo(() => {
    switch (currentPage) {
      case 'dashboard':
        return DashboardPage;
      case 'connect':
        return ConnectPage;
      case 'rewards':
        return RewardsPage;
      case 'history':
        return HistoryPage;
      default:
        return DashboardPage;
    }
  }, [currentPage]);

  return (
    // Main container
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
      
      {/* Desktop Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
        <CurrentPageComponent />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;