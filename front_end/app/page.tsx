"use client";

import React, { useState, useMemo } from 'react';
import { Page } from '@/lib/types';
import { Sidebar } from '@/components/app/navigation/sidebar';
import { BottomNav } from '@/components/app/navigation/bottom-nav';
import { DashboardPage } from '@/components/app/pages/dashboard-page';
import { ConnectPage } from '@/components/app/pages/connect-page';
import { RewardsPage } from '@/components/app/pages/rewards-page';
import { HistoryPage } from '@/components/app/pages/history-page';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

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
    <div className="flex flex-col md:flex-row min-h-screen bg-background font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
        <CurrentPageComponent />
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;