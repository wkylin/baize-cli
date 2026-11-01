import type { Component } from 'vue';
import type { Role } from '../services/auth';
import { registeredPages } from './route-registry';

export type PageIcon = 'dashboard' | 'users' | 'settings' | 'file';

export interface PageRoute {
  path: `/${string}`;
  title: string;
  titleKey?: string;
  icon: PageIcon;
  order: number;
  roles?: Role[];
}

export interface PageEntry {
  route: PageRoute;
  component: () => Promise<{ default: Component }>;
}

export const pages: PageEntry[] = registeredPages.sort(
  (a, b) => a.route.order - b.route.order
);

export function canAccess(route: PageRoute, role: Role) {
  return !route.roles || route.roles.includes(role);
}
