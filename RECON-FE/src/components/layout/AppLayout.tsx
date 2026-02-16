import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-stone-950 dark:via-blue-950/20 dark:to-stone-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} sidebarOpen={sidebarOpen} />
        <main className="p-4 md:p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
