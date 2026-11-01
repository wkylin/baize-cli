<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElDrawer, ElTooltip } from 'element-plus';
import { LogOut, Menu } from '@lucide/vue';
import AppNavigation from './AppNavigation.vue';
import { pages } from './routes';
import { useAuthStore } from '../stores/auth';

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const drawerOpen = ref(false);
const current = computed(() =>
  pages.find((page) => page.route.path === route.path)
);
const accountName = computed(() =>
  auth.session?.email.endsWith('@baize.dev')
    ? t(`role.${auth.session.role}`)
    : auth.session?.name || ''
);

async function signOut() {
  await auth.signOut();
  await router.replace('/login');
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar"><AppNavigation /></aside>
    <ElDrawer
      v-model="drawerOpen"
      class="mobile-navigation"
      direction="ltr"
      size="268px"
      :with-header="false"
    >
      <AppNavigation @select="drawerOpen = false" />
    </ElDrawer>
    <div class="main-column">
      <header class="topbar">
        <div class="topbar-leading">
          <ElTooltip :content="t('app.openNavigation')">
            <ElButton
              class="mobile-menu icon-button"
              text
              :aria-label="t('app.openNavigation')"
              @click="drawerOpen = true"
            >
              <Menu :size="19" />
            </ElButton>
          </ElTooltip>
          <div class="topbar-title">
            <span>{{ t('app.workspace') }}</span>
            <strong>{{
              current
                ? current.route.titleKey
                  ? t(current.route.titleKey)
                  : current.route.title
                : t('app.console')
            }}</strong>
          </div>
        </div>
        <div class="account-actions">
          <span class="account-avatar">{{ accountName.slice(0, 1) }}</span>
          <div class="account-text">
            <strong>{{ accountName }}</strong
            ><span>{{ t('app.localDemo') }}</span>
          </div>
          <ElTooltip :content="t('app.signOut')">
            <ElButton
              class="icon-button"
              text
              :aria-label="t('app.signOut')"
              @click="signOut"
            >
              <LogOut :size="18" />
            </ElButton>
          </ElTooltip>
        </div>
      </header>
      <main class="content"><RouterView /></main>
    </div>
  </div>
</template>
