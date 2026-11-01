import { useState } from 'react';
import { Avatar, Button, Drawer, Tooltip } from 'antd';
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './auth-context';
import { usePreferences } from './preferences';
import { canAccess, pages, type PageIcon } from './routes';
import project from './project.json';

const icons: Record<PageIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: UsersRound,
  settings: Settings2,
  file: FileText,
};

function Navigation({ onSelect }: { onSelect?: () => void }) {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const { t } = useTranslation();
  return (
    <div className="navigation">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          {project.displayName.slice(0, 1)}
        </span>
        <div>
          <strong>{project.displayName}</strong>
          <span>{t('app.console')}</span>
        </div>
      </div>
      <div className="workspace-label">{preferences.workspaceName}</div>
      <nav aria-label={t('app.navigation')} className="nav-items">
        {pages
          .filter((page) => session && canAccess(page.route, session.role))
          .map((page) => {
            const Icon = icons[page.route.icon];
            return (
              <NavLink
                key={page.route.path}
                to={page.route.path}
                onClick={onSelect}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>
                  {page.route.titleKey
                    ? t(page.route.titleKey)
                    : page.route.title}
                </span>
              </NavLink>
            );
          })}
      </nav>
      <div className="nav-bottom">
        <span className="status-dot" /> {t('app.localDemo')}
      </div>
    </div>
  );
}

export function AppShell() {
  const { session, signOut } = useAuth();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const current = pages.find((page) => page.route.path === location.pathname);

  async function logout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Navigation />
      </aside>
      <Drawer
        className="mobile-navigation"
        placement="left"
        size={268}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
        title={t('app.navigation')}
      >
        <Navigation onSelect={() => setDrawerOpen(false)} />
      </Drawer>
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-leading">
            <Tooltip title={t('app.openNavigation')}>
              <Button
                className="mobile-menu"
                type="text"
                icon={<Menu size={19} />}
                aria-label={t('app.openNavigation')}
                onClick={() => setDrawerOpen(true)}
              />
            </Tooltip>
            <div className="topbar-title">
              <span>{t('app.workspace')}</span>
              <strong>
                {current
                  ? current.route.titleKey
                    ? t(current.route.titleKey)
                    : current.route.title
                  : t('app.console')}
              </strong>
            </div>
          </div>
          <div className="account-actions">
            <Avatar className="account-avatar">
              {session?.email.endsWith('@baize.dev')
                ? t(`role.${session.role}`).slice(0, 1)
                : session?.name.slice(0, 1)}
            </Avatar>
            <div className="account-text">
              <strong>
                {session?.email.endsWith('@baize.dev')
                  ? t(`role.${session.role}`)
                  : session?.name}
              </strong>
              <span>
                {session?.email.endsWith('@baize.dev')
                  ? t('app.localDemo')
                  : t(session?.role === 'admin' ? 'role.admin' : 'role.viewer')}
              </span>
            </div>
            <Tooltip title={t('app.signOut')}>
              <Button
                type="text"
                icon={<LogOut size={18} />}
                aria-label={t('app.signOut')}
                onClick={logout}
              />
            </Tooltip>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
