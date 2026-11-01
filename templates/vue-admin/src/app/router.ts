import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import type { Pinia } from 'pinia';
import AppShell from './AppShell.vue';
import LoginPage from '../screens/LoginPage.vue';
import ErrorPage from '../screens/ErrorPage.vue';
import { pages } from './routes';
import { useAuthStore } from '../stores/auth';
import type { Role } from '../services/auth';

export function createAppRouter(pinia: Pinia) {
  const routes: RouteRecordRaw[] = [
    { path: '/login', component: LoginPage },
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', redirect: '/dashboard' },
        ...pages.map((entry) => ({
          path: entry.route.path.slice(1),
          component: entry.component,
          meta: { roles: entry.route.roles },
        })),
        { path: 'forbidden', component: ErrorPage, props: { code: 403 } },
        { path: ':pathMatch(.*)*', component: ErrorPage, props: { code: 404 } },
      ],
    },
  ];
  const router = createRouter({ history: createWebHistory(), routes });
  router.beforeEach((to) => {
    const auth = useAuthStore(pinia);
    if (to.path === '/login') return auth.session ? '/dashboard' : true;
    if (!auth.session) return { path: '/login', query: { from: to.fullPath } };
    const roles = to.meta.roles as Role[] | undefined;
    if (roles && !roles.includes(auth.session.role)) return '/forbidden';
    return true;
  });
  return router;
}
