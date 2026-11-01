import { useEffect, useState } from 'react';
import { Button, Form, Input, Segmented, message } from 'antd';
import { Check, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  accentColors,
  usePreferences,
  type Density,
  type Language,
  type Preferences,
  type ThemeMode,
} from '../app/preferences';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { preferences, save } = usePreferences();
  const [form] = Form.useForm<Pick<Preferences, 'workspaceName'>>();
  const [draft, setDraft] = useState(preferences);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    form.setFieldsValue({ workspaceName: preferences.workspaceName });
    setDraft(preferences);
  }, [form, preferences]);

  function submit(values: Pick<Preferences, 'workspaceName'>) {
    save({ ...draft, workspaceName: values.workspaceName.trim() });
    messageApi.success(t('settings.saved'));
  }

  return (
    <section className="page settings-page">
      {contextHolder}
      <header className="page-heading">
        <div>
          <p className="eyebrow">{t('settings.eyebrow')}</p>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>
      </header>
      <div className="settings-form">
        <Form<Pick<Preferences, 'workspaceName'>>
          form={form}
          layout="vertical"
          onFinish={submit}
          requiredMark={false}
        >
          <div className="setting-row">
            <div>
              <h2>{t('settings.workspaceName')}</h2>
              <p>{t('settings.workspaceHint')}</p>
            </div>
            <Form.Item
              name="workspaceName"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: t('settings.nameRequired'),
                },
                { max: 30, message: t('settings.nameMax') },
              ]}
            >
              <Input size="large" placeholder={t('settings.workspaceName')} />
            </Form.Item>
          </div>
          <div className="setting-row">
            <div>
              <h2>{t('settings.theme')}</h2>
              <p>{t('settings.appearanceHint')}</p>
            </div>
            <Segmented
              value={draft.themeMode}
              onChange={(value) =>
                setDraft({ ...draft, themeMode: value as ThemeMode })
              }
              options={[
                { label: t('settings.system'), value: 'system' },
                { label: t('settings.light'), value: 'light' },
                { label: t('settings.dark'), value: 'dark' },
              ]}
            />
          </div>
          <div className="setting-row">
            <div>
              <h2>{t('settings.accent')}</h2>
            </div>
            <div
              className="accent-swatches"
              role="group"
              aria-label={t('settings.accent')}
            >
              {accentColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="accent-swatch"
                  style={{ backgroundColor: color }}
                  aria-label={`${t('settings.accent')} ${color}`}
                  aria-pressed={draft.accentColor === color}
                  onClick={() => setDraft({ ...draft, accentColor: color })}
                >
                  {draft.accentColor === color && (
                    <Check size={17} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="setting-row">
            <div>
              <h2>{t('settings.density')}</h2>
            </div>
            <Segmented
              value={draft.density}
              onChange={(value) =>
                setDraft({ ...draft, density: value as Density })
              }
              options={[
                { label: t('settings.comfortable'), value: 'comfortable' },
                { label: t('settings.compact'), value: 'compact' },
              ]}
            />
          </div>
          <div className="setting-row">
            <div>
              <h2>{t('settings.language')}</h2>
            </div>
            <Segmented
              value={draft.language}
              onChange={(value) =>
                setDraft({ ...draft, language: value as Language })
              }
              options={[
                { label: t('settings.chinese'), value: 'zh' },
                { label: t('settings.english'), value: 'en' },
              ]}
            />
          </div>
          <div className="settings-actions">
            <Button type="primary" htmlType="submit" icon={<Save size={16} />}>
              {t('settings.save')}
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
}
