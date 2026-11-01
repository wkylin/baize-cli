import { defineStore } from 'pinia';
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

const storageKey = 'baize.vue.demo.preferences';
const defaultNames: Record<Language, string> = {
  zh: '主工作区',
  en: 'Main workspace',
};
export const defaults: Preferences = {
  workspaceName: defaultNames.zh,
  themeMode: 'system',
  accentColor: '#137c81',
  density: 'comfortable',
  language: 'zh',
};

export function parsePreferences(value: unknown): Preferences {
  const input =
    value && typeof value === 'object' ? (value as Partial<Preferences>) : {};
  const language = input.language === 'en' ? 'en' : 'zh';
  const storedName =
    typeof input.workspaceName === 'string' && input.workspaceName.trim()
      ? input.workspaceName.trim().slice(0, 30)
      : defaultNames[language];
  return {
    workspaceName: Object.values(defaultNames).includes(storedName)
      ? defaultNames[language]
      : storedName,
    themeMode:
      input.themeMode === 'light' || input.themeMode === 'dark'
        ? input.themeMode
        : 'system',
    accentColor:
      accentColors.find((color) => color === input.accentColor) ||
      defaults.accentColor,
    density: input.density === 'compact' ? 'compact' : 'comfortable',
    language,
  };
}

function readPreferences() {
  try {
    return parsePreferences(
      JSON.parse(localStorage.getItem(storageKey) || 'null')
    );
  } catch {
    return defaults;
  }
}

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    ...readPreferences(),
    systemDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  }),
  getters: {
    isDark: (state) =>
      state.themeMode === 'dark' ||
      (state.themeMode === 'system' && state.systemDark),
  },
  actions: {
    initialize() {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', () => {
        this.systemDark = media.matches;
        this.apply();
      });
      this.apply();
    },
    save(value: Preferences) {
      const next = parsePreferences(value);
      Object.assign(this, next);
      localStorage.setItem(storageKey, JSON.stringify(next));
      this.apply();
    },
    apply() {
      const root = document.documentElement;
      root.dataset.theme = this.isDark ? 'dark' : 'light';
      root.classList.toggle('dark', this.isDark);
      root.dataset.density = this.density;
      root.style.setProperty('--accent', this.accentColor);
      root.style.setProperty('--boot-accent', this.accentColor);
      root.lang = this.language === 'zh' ? 'zh-CN' : 'en';
      i18n.global.locale.value = this.language;
    },
  },
});
