export type Role = 'admin' | 'viewer';

export interface Session {
  name: string;
  email: string;
  role: Role;
}

export interface AuthService {
  read(): Session | null;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
}

const sessionKey = 'baize.demo.session';
const accounts: Array<Session & { password: string }> = [
  {
    name: '管理员',
    email: 'admin@baize.dev',
    role: 'admin',
    password: 'Demo123!',
  },
  {
    name: '访客',
    email: 'viewer@baize.dev',
    role: 'viewer',
    password: 'Demo123!',
  },
];

export const authService: AuthService = {
  read() {
    try {
      const value = JSON.parse(
        sessionStorage.getItem(sessionKey) || 'null'
      ) as Session | null;
      if (
        value &&
        typeof value.email === 'string' &&
        (value.role === 'admin' || value.role === 'viewer')
      )
        return value;
    } catch {
      // Invalid demo data is treated as a signed-out session.
    }
    return null;
  },
  async signIn(email, password) {
    const account = accounts.find(
      (item) =>
        item.email === email.trim().toLowerCase() && item.password === password
    );
    if (!account) throw new Error(i18n.t('login.invalidCredentials'));
    const session: Session = {
      name: account.name,
      email: account.email,
      role: account.role,
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(session));
    return session;
  },
  async signOut() {
    sessionStorage.removeItem(sessionKey);
  },
};
import i18n from '../i18n';
