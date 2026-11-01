import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/auth-context';
import { StatusBadge } from '../components/StatusBadge';
import { userService, type User } from '../services/users';

export default function DashboardPage() {
  const { session } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    userService
      .list()
      .then((result) => {
        if (active) setUsers(result);
      })
      .catch(() => {
        if (active) setError('dashboard.loadError');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeCount = users.filter((user) => user.status === 'active').length;
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const recent = [...users]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <section className="page dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{t('dashboard.eyebrow')}</p>
          <h1>{t('dashboard.title')}</h1>
          <p>
            {t('dashboard.welcome', {
              name: session?.email.endsWith('@baize.dev')
                ? t(`role.${session.role}`)
                : session?.name,
            })}
          </p>
        </div>
        {session?.role === 'admin' && (
          <Link className="text-link" to="/users">
            {t('dashboard.manageUsers')} <ArrowUpRight size={17} />
          </Link>
        )}
      </header>
      {error && (
        <div className="load-error" role="alert">
          {t(error)}
        </div>
      )}
      <div
        className="metric-strip"
        role="group"
        aria-label={t('dashboard.overview')}
      >
        <div className="metric">
          <span>{t('dashboard.totalUsers')}</span>
          <strong>{loading || error ? '--' : users.length}</strong>
          <small>
            <UsersRound size={14} /> {t('dashboard.workspaceAccounts')}
          </small>
        </div>
        <div className="metric">
          <span>{t('dashboard.activeUsers')}</span>
          <strong>{loading || error ? '--' : activeCount}</strong>
          <small>
            <CheckCircle2 size={14} /> {t('dashboard.available')}
          </small>
        </div>
        <div className="metric">
          <span>{t('dashboard.admins')}</span>
          <strong>{loading || error ? '--' : adminCount}</strong>
          <small>{t('dashboard.manageAccess')}</small>
        </div>
      </div>
      <div
        className={`dashboard-sections${session?.role === 'admin' ? '' : ' compact'}`}
      >
        {session?.role === 'admin' && (
          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <h2>{t('dashboard.recentUsers')}</h2>
                <p>{t('dashboard.byCreated')}</p>
              </div>
            </div>
            <div className="recent-list">
              {loading && (
                <div className="empty-state">{t('dashboard.loading')}</div>
              )}
              {recent.map((user) => (
                <div className="recent-row" key={user.id}>
                  <span className="person-initial">
                    {user.name.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <StatusBadge
                    status={user.status}
                    label={t(`status.${user.status}`)}
                  />
                </div>
              ))}
              {!loading && !error && recent.length === 0 && (
                <div className="empty-state">{t('dashboard.noUsers')}</div>
              )}
            </div>
          </section>
        )}
        <section className="dashboard-section activity-section">
          <div className="section-heading">
            <div>
              <h2>{t('dashboard.activity')}</h2>
              <p>{t('dashboard.currentWorkspace')}</p>
            </div>
          </div>
          <div className="overview-line">
            <span>{t('dashboard.accountStatus')}</span>
            <strong>
              {loading || error
                ? '--'
                : t('dashboard.activeCount', {
                    active: activeCount,
                    total: users.length,
                  })}
            </strong>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: `${users.length ? (activeCount / users.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="overview-line">
            <span>{t('dashboard.accessRoles')}</span>
            <strong>{t('dashboard.roles')}</strong>
          </div>
        </section>
      </div>
    </section>
  );
}
