import type { PageEntry } from './routes';
import { route as route0 } from '../pages/dashboard.route';
import { route as route1 } from '../pages/settings.route';
import { route as route2 } from '../pages/users.route';

export const registeredPages: PageEntry[] = [
  { route: route0, component: () => import('../pages/dashboard.vue') },
  { route: route1, component: () => import('../pages/settings.vue') },
  { route: route2, component: () => import('../pages/users.vue') },
];
