"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, Gift, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define items inside the client component or in a separate .ts file imported here
const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/connect', label: 'Connect Payments', icon: CreditCard },
  { href: '/rewards', label: 'Redeem Rewards', icon: Gift },
  { href: '/history', label: 'History', icon: History },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex md:flex-col md:w-64 bg-card shadow-lg border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">HousrCash</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col py-4 space-y-1">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <li key={item.href}>
                 <Button
                   asChild
                   variant={isActive ? 'default' : 'ghost'}
                   className="w-full justify-start transition-colors duration-200"
                 >
                   <Link href={item.href}>
                     <item.icon className="w-5 h-5 mr-3" />
                     <span>{item.label}</span>
                   </Link>
                 </Button>
               </li>
             );
           })}
        </ul>
      </div>
    </nav>
  );
};