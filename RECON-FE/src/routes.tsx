import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StaffRedirect } from './components/StaffRedirect';
import { ROUTES } from './constants/routes';
import {
  HomePage,
  ServicesPage,
  ServiceDetailPage,
  ProjectsPage,
  ProjectDetailPage,
  ConsultationsPage,
  AppointmentsPage,
  AiPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  MyConsultationsPage,
  MyAppointmentsPage,
  AdminConsultationsPage,
  AdminAppointmentsPage,
  ProfilePage,
} from './pages';

const withLayout: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <AppLayout><Outlet /></AppLayout>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/:id', element: <ServiceDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      {
        path: 'consultations',
        element: (
          <StaffRedirect>
            <ConsultationsPage />
          </StaffRedirect>
        ),
      },
      {
        path: 'appointments',
        element: (
          <StaffRedirect>
            <AppointmentsPage />
          </StaffRedirect>
        ),
      },
      { path: 'ai', element: <AiPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'consultations/my',
        element: (
          <ProtectedRoute userOnly>
            <MyConsultationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'appointments/my',
        element: (
          <ProtectedRoute userOnly>
            <MyAppointmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireStaff>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/consultations',
        element: (
          <ProtectedRoute requireStaff>
            <AdminConsultationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/appointments',
        element: (
          <ProtectedRoute requireStaff>
            <AdminAppointmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
];

export const router = createBrowserRouter(withLayout);
