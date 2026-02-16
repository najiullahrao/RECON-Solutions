import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api';
import { isApiError } from '../types/api';
import type { AuthSession, LoginPayload, RegisterPayload } from '../types/api';
import { clearCachedChat } from '../lib/chatCache';

const STORAGE_KEY = 'recon_session';

type AuthState = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (payload: LoginPayload) => Promise<{ error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: readStoredSession(),
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const session = readStoredSession();
    const isAuthenticated = Boolean(session?.session?.access_token);
    setState((s) => ({ ...s, session, isAuthenticated, isLoading: false }));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    if (isApiError(res)) {
      return { error: res.error.message };
    }
    const data = res.data;
    if (!data?.user || !data?.session?.access_token) {
      return { error: 'Invalid response' };
    }
    const session: AuthSession = { user: data.user, session: data.session };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setState({
      session,
      isAuthenticated: true,
      isLoading: false,
    });
    return {};
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    if (isApiError(res)) {
      return { error: res.error.message };
    }
    return {};
  }, []);

  const logout = useCallback(() => {
    setState((prev) => {
      clearCachedChat(prev.session?.user?.id);
      localStorage.removeItem(STORAGE_KEY);
      return { session: null, isAuthenticated: false, isLoading: false };
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
    }),
    [state.session, state.isAuthenticated, state.isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
