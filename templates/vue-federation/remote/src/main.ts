import { createApp } from 'vue';
import RemotePage from './RemotePage.vue';
import './styles.css';

createApp(RemotePage).mount('#app');
const splash = document.getElementById('boot-splash');
if (splash) {
  splash.classList.add('is-exiting');
  window.setTimeout(() => splash.remove(), 240);
}
