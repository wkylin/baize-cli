<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowUpRight } from '@lucide/vue';
import { ElButton } from 'element-plus';
import StatusBadge from '../components/StatusBadge.vue';
import { useAuthStore } from '../stores/auth';
import { usePreferencesStore } from '../stores/preferences';
import { userService, type User } from '../services/users';

const { t } = useI18n();
const auth = useAuthStore();
const preferences = usePreferencesStore();
const users = ref<User[]>([]);
const loadError = ref(false);
const active = computed(
  () => users.value.filter((user) => user.status === 'active').length
);
const admins = computed(
  () => users.value.filter((user) => user.role === 'admin').length
);
const recent = computed(() =>
  [...users.value]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)
);
const activeShare = computed(() =>
  users.value.length ? Math.round((active.value / users.value.length) * 100) : 0
);
const accountName = computed(() =>
  auth.session?.email.endsWith('@baize.dev')
    ? t(`role.${auth.session.role}`)
    : auth.session?.name || ''
);

async function refresh() {
  loadError.value = false;
  try {
    users.value = await userService.list();
  } catch {
    loadError.value = true;
  }
}

function date(value: string) {
  return new Date(value).toLocaleDateString(
    preferences.language === 'en' ? 'en-US' : 'zh-CN'
  );
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <section class="page dashboard-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">{{ t('dashboard.eyebrow') }}</p>
        <h1>{{ t('dashboard.title') }}</h1>
        <p>
          {{ t('dashboard.welcome', { name: accountName }) }}
          {{ t('dashboard.subtitle') }}
        </p>
      </div>
      <RouterLink
        v-if="auth.session?.role === 'admin'"
        to="/users"
        class="text-link"
      >
        {{ t('dashboard.manageUsers') }} <ArrowUpRight :size="15" />
      </RouterLink>
    </header>
    <div v-if="loadError" class="load-error" role="alert">
      {{ t('dashboard.loadError') }}
      <ElButton link @click="refresh">{{ t('dashboard.retry') }}</ElButton>
    </div>
    <div class="metric-strip">
      <div class="metric">
        <span>{{ t('dashboard.totalUsers') }}</span
        ><strong>{{ users.length }}</strong>
      </div>
      <div class="metric">
        <span>{{ t('dashboard.activeUsers') }}</span
        ><strong>{{ active }}</strong>
      </div>
      <div class="metric">
        <span>{{ t('dashboard.inactiveUsers') }}</span
        ><strong>{{ users.length - active }}</strong>
      </div>
    </div>
    <div class="dashboard-sections">
      <section class="dashboard-section">
        <div class="section-heading">
          <h2>{{ t('dashboard.recentUsers') }}</h2>
        </div>
        <div v-if="recent.length === 0" class="empty-state">
          {{ t('dashboard.noUsers') }}
        </div>
        <div v-for="user in recent" :key="user.id" class="recent-row">
          <span class="person-initial">{{ user.name.slice(0, 1) }}</span>
          <div>
            <strong>{{ user.name }}</strong
            ><span>{{ user.email }} · {{ date(user.createdAt) }}</span>
          </div>
          <StatusBadge
            :status="user.status"
            :label="t(`status.${user.status}`)"
          />
        </div>
      </section>
      <section class="dashboard-section">
        <div class="section-heading">
          <h2>{{ t('dashboard.usage') }}</h2>
        </div>
        <div class="overview-line">
          <span>{{ t('dashboard.adminCount') }}</span
          ><strong>{{ admins }}</strong>
        </div>
        <div class="overview-line">
          <span>{{ t('dashboard.viewerCount') }}</span
          ><strong>{{ users.length - admins }}</strong>
        </div>
        <div class="overview-line">
          <span>{{ t('dashboard.activeShare') }}</span
          ><strong>{{ activeShare }}%</strong>
        </div>
        <div class="progress-track">
          <span :style="{ width: `${activeShare}%` }" />
        </div>
      </section>
    </div>
  </section>
</template>
