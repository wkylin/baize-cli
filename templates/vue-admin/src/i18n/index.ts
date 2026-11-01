import { createI18n } from 'vue-i18n';
import { messages } from './resources';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages,
});

export default i18n;
