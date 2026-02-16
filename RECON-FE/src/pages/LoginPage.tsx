import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.HOME;

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login({ email: email.trim(), password });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Log in</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Sign in to manage appointments and consultations.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Account</h2>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Log in
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-stone-600 dark:text-stone-400">
            Don’t have an account?{' '}
            <Link to={ROUTES.REGISTER} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
