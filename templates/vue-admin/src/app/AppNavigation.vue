<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { FileText, LayoutDashboard, Settings2, UsersRound } from '@lucide/vue';
import { useAuthStore } from '../stores/auth';
import { usePreferencesStore } from '../stores/preferences';
import { canAccess, pages } from './routes';
import project from './project.json';

const emit = defineEmits<{ select: [] }>();
const { t } = useI18n();
const auth = useAuthStore();
const preferences = usePreferencesStore();
const icons = {
  dashboard: LayoutDashboard,
  users: UsersRound,
  settings: Settings2,
  file: FileText,
};
const visiblePages = computed(() =>
  pages.filter(
    (page) => auth.session && canAccess(page.route, auth.session.role)
  )
);
</script>

<template>
  <div class="navigation">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">{{
        project.displayName.slice(0, 1)
      }}</span>
      <div>
        <strong>{{ project.displayName }}</strong>
        <span>{{ t('app.console') }}</span>
      </div>
    </div>
    <div class="workspace-label">{{ preferences.workspaceName }}</div>
    <nav class="nav-items" :aria-label="t('app.navigation')">
      <RouterLink
        v-for="page in visiblePages"
        :key="page.route.path"
        :to="page.route.path"
        class="nav-item"
        active-class="active"
        @click="emit('select')"
      >
        <component
          :is="icons[page.route.icon]"
          :size="18"
          :stroke-width="1.8"
          aria-hidden="true"
        />
        <span>{{
          page.route.titleKey ? t(page.route.titleKey) : page.route.title
        }}</span>
      </RouterLink>
    </nav>
    <div class="nav-bottom">
      <span class="status-dot" />{{ t('app.localDemo') }}
    </div>
  </div>
</template>
