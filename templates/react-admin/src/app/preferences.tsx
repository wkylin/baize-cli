import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import i18n from '../i18n';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export type Language = 'zh' | 'en';
export const accentColors = [
  '#137c81',
  '#2868a5',
  '#2c7655',
  '#ad4d57',
] as const;
export type AccentColor = (typeof accentColors)[number];

export interface Preferences {
  workspaceName: string;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  density: Density;
  language: Language;
}

const storageKey = 'baize.demo.preferences';
const defaultWorkspaceNames: Record<Language, string> = {
  zh: '主工作区',
  en: 'Main workspace',
};
export const defaults: Preferences = {
  workspaceName: defaultWorkspaceNames.zh,
  themeMode: 'system',
  accentColor: '#137c81',
  density: 'comfortable',
  language: 'zh',
};

export function parsePreferences(value: unknown): Preferences {
  const input =
    value && typeof value === 'object'
      ? (value as Partial<Preferences> & { darkMode?: boolean })
      : {};
  const themeMode =
    input.themeMode === 'light' ||
    input.themeMode === 'dark' ||
    input.themeMode === 'system'
      ? input.themeMode
      : typeof input.darkMode === 'boolean'
        ? input.darkMode
          ? 'dark'
          : 'light'
        : defaults.themeMode;
  const language = input.language === 'en' ? 'en' : 'zh';
  const storedName =
    typeof input.workspaceName === 'string' && input.workspaceName.trim()
      ? input.workspaceName.trim().slice(0, 30)
      : defaultWorkspaceNames[language];
  return {
    workspaceName: Object.values(defaultWorkspaceNames).includes(storedName)
      ? defaultWorkspaceNames[language]
      : storedName,
    themeMode,
    accentColor:
      accentColors.find((color) => color === input.accentColor) ||
      defaults.accentColor,
    density: input.density === 'compact' ? 'compact' : 'comfortable',
    language,
  };
}

function readPreferences(): Preferences {
  try {
    return parsePreferences(
      JSON.parse(localStorage.getItem(storageKey) || 'null')
    );
  } catch {
    return defaults;
  }
}

interface PreferencesContextValue {
  preferences: Preferences;
  save(value: Preferences): void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  function save(value: Preferences) {
    const next = parsePreferences(value);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setPreferences(next);
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const darkMode =
    preferences.themeMode === 'dark' ||
    (preferences.themeMode === 'system' && systemDark);
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.density = preferences.density;
    document.documentElement.style.setProperty(
      '--accent',
      preferences.accentColor
    );
    document.documentElement.style.setProperty(
      '--boot-accent',
      preferences.accentColor
    );
    document.documentElement.lang =
      preferences.language === 'zh' ? 'zh-CN' : 'en';
    void i18n.changeLanguage(preferences.language);
  }, [
    darkMode,
    preferences.accentColor,
    preferences.density,
    preferences.language,
  ]);

  return (
    <PreferencesContext.Provider value={{ preferences, save }}>
      <ConfigProvider
        locale={preferences.language === 'zh' ? zhCN : enUS}
        theme={{
          algorithm: [
            darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            ...(preferences.density === 'compact'
              ? [theme.compactAlgorithm]
              : []),
          ],
          token: {
            colorPrimary: preferences.accentColor,
            borderRadius: 6,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('PreferencesProvider is missing');
  return context;
}
