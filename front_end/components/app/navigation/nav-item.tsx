"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Page } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  item: { page: Page; label: string; icon: React.ElementType };
  isMobile: boolean;
  // onClick and isActive props are no longer needed here as we use usePathname
}

export const NavItem: React.FC<NavItemProps> = ({ item, isMobile }) => {
  const Icon = item.icon;
  const pathname = usePathname();

  // Determine target path based on your 'page' identifier
  const href = item.page === 'dashboard' ? '/' : `/${item.page}`;
  // Check if active
  const isActive = pathname === href;

  return (
    <li>
      <Button
        asChild
        variant={isActive ? (isMobile ? 'ghost' : 'default') : 'ghost'}
        className={`w-full h-full transition-colors duration-200 ${isMobile ? 'flex-col text-xs h-16 rounded-none' : 'justify-start'}`}
      >
        <Link href={href}>
            <Icon className={isMobile ? 'w-6 h-6' : 'w-5 h-5 mr-3'} />
            <span className={isMobile ? 'mt-1' : ''}>
            {isMobile ? item.label.split(' ')[0] : item.label}
            </span>
        </Link>
      </Button>
    </li>
  );
};