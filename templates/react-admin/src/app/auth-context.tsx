import { createContext, useContext, useState, type ReactNode } from 'react';
import { authService, type Session } from '../services/auth';

interface AuthContextValue {
  session: Session | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    authService.read()
  );

  async function signIn(email: string, password: string) {
    setSession(await authService.signIn(email, password));
  }

  async function signOut() {
    await authService.signOut();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is missing');
  return context;
}
