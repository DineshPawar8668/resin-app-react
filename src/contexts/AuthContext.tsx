import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUser, setToken, setLoading, logout as logoutAction } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Flexible extraction for different API response shapes
// e.g. { success, data: { customer, token } } or { data: { user, access_token } }
const extractCustomer = (response: Record<string, unknown>): Record<string, unknown> => {
  const d = response?.data as Record<string, unknown> | undefined;
  return (d?.customer ?? d?.user ?? response?.customer ?? response?.user ?? response) as Record<string, unknown>;
};

const extractToken = (response: Record<string, unknown>): string => {
  const d = response?.data as Record<string, unknown> | undefined;
  return ((d?.token ?? d?.access_token ?? response?.token ?? response?.access_token) as string) ?? '';
};

const normalizeUser = (raw: Record<string, unknown>): UserProfile => ({
  id: (raw._id ?? raw.id ?? '') as string,
  email: (raw.email ?? '') as string,
  name: (raw.name ?? '') as string,
  avatar_url: raw.avatar_url as string | undefined,
  is_admin: (raw.is_admin ?? false) as boolean,
  created_at: ((raw.created_at ?? raw.createdAt) ?? '') as string,
  updated_at: ((raw.updated_at ?? raw.updatedAt) ?? '') as string,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  // On every page load: if a token is in localStorage, re-validate it by calling
  // /auth/profile. This is what keeps the user logged in after a browser refresh.
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authService
        .getProfile()
        .then((response) => {
          const raw = response.data;
          dispatch(setUser(normalizeUser(raw)));
        })
        .catch(() => {
          // Token is invalid / expired — clear everything
          dispatch(logoutAction());
        });
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const signUp = async (email: string, password: string, name: string) => {
    await authService.register({ name, email, password });
  };

  const signIn = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const res = response as Record<string, unknown>;
    const token = extractToken(res);
    const raw = extractCustomer(res);
    dispatch(setToken(token));
    dispatch(setUser(normalizeUser(raw)));
  };

  const signOut = () => {
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider value={{ signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
