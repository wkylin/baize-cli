import { lazy } from 'react';
import type { PageEntry } from './routes';
import { route as route0 } from '../pages/dashboard.route';
import { route as route1 } from '../pages/settings.route';
import { route as route2 } from '../pages/users.route';

export const registeredPages: PageEntry[] = [
  { route: route0, Component: lazy(() => import('../pages/dashboard')) },
  { route: route1, Component: lazy(() => import('../pages/settings')) },
  { route: route2, Component: lazy(() => import('../pages/users')) },
];
