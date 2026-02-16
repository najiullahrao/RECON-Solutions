import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      admin: { deleteUser: vi.fn() }
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('auth.service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('login returns error when signInWithPassword fails', async () => {
    const { supabase } = await import('../../src/config/supabase.js');
    const { login } = await import('../../src/services/auth.service.js');
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials', name: 'AuthError', status: 401 }
    } as never);
    const result = await login({ email: 'a@b.com', password: 'wrong' });
    expect('error' in result).toBe(true);
    expect('error' in result && result.error).toBe('Invalid credentials');
  });
});
