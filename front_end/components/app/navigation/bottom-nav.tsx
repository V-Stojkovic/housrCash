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

export const BottomNav: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
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
