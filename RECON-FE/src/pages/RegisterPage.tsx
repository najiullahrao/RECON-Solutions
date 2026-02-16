import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isAuthenticated) {
    navigate(ROUTES.HOME, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await register({
      full_name: fullName.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-stone-700 dark:text-stone-300">
              Account created. Please check your email to confirm, then log in.
            </p>
            <Link to={ROUTES.LOGIN} className="mt-4 inline-block">
              <Button variant="primary">Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Sign up</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">
          Create an account to book appointments and track requests.
        </p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Create account</h2>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign up
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-stone-600 dark:text-stone-400">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
