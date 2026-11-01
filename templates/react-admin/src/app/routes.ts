import type { ComponentType, LazyExoticComponent } from 'react';
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

export interface PageModule {
  default: ComponentType;
}

export interface PageEntry {
  route: PageRoute;
  Component: LazyExoticComponent<ComponentType>;
}

export const pages: PageEntry[] = registeredPages.sort(
  (a, b) => a.route.order - b.route.order
);

export function canAccess(route: PageRoute, role: Role) {
  return !route.roles || route.roles.includes(role);
}
