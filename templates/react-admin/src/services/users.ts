import type { Role } from './auth';
import i18n from '../i18n';

export type UserStatus = 'active' | 'inactive';
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export type UserInput = Pick<User, 'name' | 'email' | 'role' | 'status'>;

export interface UserService {
  list(): Promise<User[]>;
  save(input: UserInput, id?: string): Promise<User>;
  remove(id: string): Promise<void>;
}

const storageKey = 'baize.demo.users.v1';
const seed: User[] = [
  {
    id: 'u-1',
    name: '林悦',
    email: 'lin.yue@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2026-10-25T09:00:00.000Z',
  },
  {
    id: 'u-2',
    name: '陈墨',
    email: 'chen.mo@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-10-24T09:00:00.000Z',
  },
  {
    id: 'u-3',
    name: '周宁',
    email: 'zhou.ning@example.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2026-10-23T09:00:00.000Z',
  },
  {
    id: 'u-4',
    name: '许岚',
    email: 'xu.lan@example.com',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2026-10-20T09:00:00.000Z',
  },
];

function readUsers(): User[] {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return [...seed];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as User[]) : [...seed];
  } catch {
    return [...seed];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}

export const userService: UserService = {
  async list() {
    return readUsers();
  },
  async save(input, id) {
    const users = readUsers();
    const email = input.email.trim().toLowerCase();
    if (
      users.some((user) => user.email.toLowerCase() === email && user.id !== id)
    ) {
      throw new Error(i18n.t('users.emailExists'));
    }
    const user: User = {
      ...input,
      name: input.name.trim(),
      email,
      id: id || crypto.randomUUID(),
      createdAt:
        users.find((item) => item.id === id)?.createdAt ||
        new Date().toISOString(),
    };
    if (id && !users.some((item) => item.id === id))
      throw new Error(i18n.t('users.notFound'));
    writeUsers(
      id
        ? users.map((item) => (item.id === id ? user : item))
        : [user, ...users]
    );
    return user;
  },
  async remove(id) {
    writeUsers(readUsers().filter((item) => item.id !== id));
  },
};
