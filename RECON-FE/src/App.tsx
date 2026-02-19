import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { GlobalWhatsAppButton } from './components/layout/GlobalWhatsAppButton';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <GlobalWhatsAppButton />
    </AuthProvider>
  );
}
