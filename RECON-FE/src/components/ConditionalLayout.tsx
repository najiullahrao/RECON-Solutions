import { useLocation, Outlet } from 'react-router-dom';
import { AppLayout } from './layout';
import { LandingPage } from '../pages/LandingPage';

export function ConditionalLayout() {
  const { pathname } = useLocation();
  if (pathname === '/') return <LandingPage />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
