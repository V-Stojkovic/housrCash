import React from 'react';
import { Page } from '@/lib/types';
import { LayoutDashboard, CreditCard, Gift, History } from 'lucide-react';
import { NavItem } from './nav-item';

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

export const Sidebar: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="hidden md:flex md:flex-col md:w-64 bg-card shadow-lg border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">HousrCash</h1>
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
