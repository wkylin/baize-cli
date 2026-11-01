import { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './auth-context';
import { canAccess, pages, type PageEntry } from './routes';
import { AppShell } from './AppShell';
import { LoginPage } from '../screens/LoginPage';

function RequireAuth() {
  const { session } = useAuth();
  const location = useLocation();
  return session ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
}

function AllowedPage({ page }: { page: PageEntry }) {
  const { session } = useAuth();
  const { t } = useTranslation();
  const Component = page.Component;
  return session && canAccess(page.route, session.role) ? (
    <Suspense fallback={<div className="page-loading">{t('app.loading')}</div>}>
      <Component />
    </Suspense>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}

function ErrorPage({ forbidden = false }: { forbidden?: boolean }) {
  const { t } = useTranslation();
  return (
    <section className="page error-page">
      <span className="error-code">{forbidden ? '403' : '404'}</span>
      <h1>{t(forbidden ? 'app.forbiddenTitle' : 'app.missingTitle')}</h1>
      <p>{t(forbidden ? 'app.forbiddenHint' : 'app.missingHint')}</p>
    </section>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {pages.map((page) => (
            <Route
              key={page.route.path}
              path={page.route.path.slice(1)}
              element={<AllowedPage page={page} />}
            />
          ))}
          <Route path="forbidden" element={<ErrorPage forbidden />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
