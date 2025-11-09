"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gift, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleSignOut } from '@/lib/auth';
import { toast } from 'sonner';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/history', label: 'History', icon: History },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const onLogout = async () => {
    try {
      await handleSignOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card shadow-t-lg border-t border-border z-50">
      <ul className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-14 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </Button>
            </li>
          );
        })}
        <li>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-14 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </Button>
        </li>
      </ul>
    </nav>
  );
};
