import { type ReactNode } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalHeader } from './GlobalHeader';
import { AppFooter } from './AppFooter';
import { useAuth } from '../../contexts/AuthContext';

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <GlobalHeader />
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col p-4 md:p-6" role="main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
        {!isAuthenticated && <AppFooter />}
      </div>
    </div>
  );
}
