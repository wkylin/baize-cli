import { Component, Suspense, lazy, type ReactNode } from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

const RemotePage = lazy(() => import('reports/RemotePage'));

class RemoteBoundary extends Component<
  { children: ReactNode; title: string; hint: string; retry: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="page error-page">
          <h1>{this.props.title}</h1>
          <p>{this.props.hint}</p>
          <Button onClick={() => window.location.reload()}>
            {this.props.retry}
          </Button>
        </section>
      );
    }
    return this.props.children;
  }
}

export default function ReportsPage() {
  const { t } = useTranslation();
  return (
    <RemoteBoundary
      title={t('remote.unavailable')}
      hint={t('remote.hint')}
      retry={t('remote.retry')}
    >
      <Suspense
        fallback={<div className="page-loading">{t('remote.loading')}</div>}
      >
        <RemotePage />
      </Suspense>
    </RemoteBoundary>
  );
}
