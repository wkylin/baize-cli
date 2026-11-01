import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { vLoading } from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles.css';
import App from './app/App.vue';
import { createAppRouter } from './app/router';
import { dismissBootSplash } from './app/boot-splash';
import { usePreferencesStore } from './stores/preferences';
import i18n from './i18n';
import project from './app/project.json';

document.title = project.displayName;
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
usePreferencesStore(pinia).initialize();
app.use(i18n);
app.directive('loading', vLoading);
const router = createAppRouter(pinia);
app.use(router);
router.isReady().then(() => {
  app.mount('#app');
  dismissBootSplash();
});
