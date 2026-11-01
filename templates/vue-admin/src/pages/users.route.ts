import type { PageRoute } from '../app/routes';

export const route: PageRoute = {
  path: '/users',
  title: '用户管理',
  titleKey: 'nav.users',
  icon: 'users',
  order: 20,
  roles: ['admin'],
};
