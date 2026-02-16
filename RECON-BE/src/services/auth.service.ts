import { supabase } from '../config/supabase.js';
import { ROLES } from '../constants/index.js';
import type { RegisterBody, LoginBody } from '../validations/auth.validations.js';

export type AuthResult = { data: { user: { id: string }; session: unknown } };
export type AuthError = { error: string };

export async function register(
  body: RegisterBody
): Promise<AuthResult | AuthError> {
  const { email, password, full_name } = body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };

  const user = data.user;
  if (!user) return { error: 'Registration failed' };

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name,
    role: ROLES.USER
  });

  if (profileError) {
    try {
      await supabase.auth.admin.deleteUser(user.id);
    } catch {
      // best-effort cleanup
    }
    return { error: 'Registration failed' };
  }

  return { data: { user: { id: user.id }, session: data.session } };
}

export async function login(body: LoginBody): Promise<AuthResult | AuthError> {
  const { email, password } = body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return { error: error.message };
  if (!data.user || !data.session) return { error: 'Login failed' };

  return { data: { user: data.user, session: data.session } };
}
