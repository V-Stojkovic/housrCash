import React from 'react';
import { Page } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  item: { page: Page; label: string; icon: React.ElementType };
  isActive: boolean;
  onClick: () => void;
  isMobile: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ item, isActive, onClick, isMobile }) => {
  const Icon = item.icon;
  
  return (
    <li>
      <Button
        variant={isActive ? (isMobile ? 'ghost' : 'default') : 'ghost'}
        onClick={onClick}
        className={`w-full h-full transition-colors duration-200 ${isMobile ? 'flex-col text-xs h-16 rounded-none' : 'justify-start'}`}
      >
        <Icon className={isMobile ? 'w-6 h-6' : 'w-5 h-5 mr-3'} />
        <span className={isMobile ? 'mt-1' : ''}>
          {isMobile ? item.label.split(' ')[0] : item.label}
        </span>
      </Button>
    </li>
  );
};
