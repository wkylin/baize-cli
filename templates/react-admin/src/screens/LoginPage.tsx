import { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/auth-context';
import project from '../app/project.json';

interface LoginValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { session, signIn } = useAuth();
  const [form] = Form.useForm<LoginValues>();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  if (session) return <Navigate to="/dashboard" replace />;

  async function submit({ email, password }: LoginValues) {
    setPending(true);
    setError('');
    try {
      await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : '/dashboard', {
        replace: true,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('login.failed'));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-layout">
      <div className="login-topline">
        <span className="brand-mark" aria-hidden="true">
          {project.displayName.slice(0, 1)}
        </span>
        <strong>{project.displayName}</strong>
        <span>{t('app.console')}</span>
      </div>
      <section className="login-content">
        <div className="login-heading">
          <span className="login-symbol">
            <LockKeyhole size={21} />
          </span>
          <p className="eyebrow">{t('login.eyebrow')}</p>
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>
        <div className="login-form-wrap">
          <Form<LoginValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={submit}
          >
            <Form.Item
              name="email"
              label={t('login.email')}
              rules={[
                { required: true, message: t('login.emailRequired') },
                { type: 'email', message: t('login.emailInvalid') },
              ]}
            >
              <Input
                size="large"
                autoComplete="username"
                placeholder="name@example.com"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={t('login.password')}
              rules={[{ required: true, message: t('login.passwordRequired') }]}
            >
              <Input.Password
                size="large"
                autoComplete="current-password"
                placeholder={t('login.passwordPlaceholder')}
              />
            </Form.Item>
            {error && (
              <Alert
                className="login-error"
                type="error"
                message={error}
                showIcon
              />
            )}
            <Button
              className="login-submit"
              type="primary"
              htmlType="submit"
              size="large"
              loading={pending}
            >
              {t('login.submit')} <ArrowRight size={17} />
            </Button>
          </Form>
          <div className="demo-accounts">
            <span>{t('login.demoAccounts')}</span>
            <button
              type="button"
              onClick={() =>
                form.setFieldsValue({
                  email: 'admin@baize.dev',
                  password: 'Demo123!',
                })
              }
            >
              {t('role.admin')}
            </button>
            <button
              type="button"
              onClick={() =>
                form.setFieldsValue({
                  email: 'viewer@baize.dev',
                  password: 'Demo123!',
                })
              }
            >
              {t('role.viewer')}
            </button>
          </div>
        </div>
      </section>
      <footer className="login-footer">
        {project.displayName} · {t('login.localDemo')}
      </footer>
    </main>
  );
}
