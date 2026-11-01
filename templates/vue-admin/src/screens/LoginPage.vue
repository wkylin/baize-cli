<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElInput } from 'element-plus';
import { ArrowRight, LockKeyhole } from '@lucide/vue';
import project from '../app/project.json';
import { useAuthStore } from '../stores/auth';

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');
const busy = ref(false);
const error = ref('');

function selectDemo(role: 'admin' | 'viewer') {
  email.value = `${role}@baize.dev`;
  password.value = 'Demo123!';
  error.value = '';
}

async function submit() {
  busy.value = true;
  error.value = '';
  try {
    await auth.signIn(email.value, password.value);
    const from =
      typeof route.query.from === 'string' && route.query.from.startsWith('/')
        ? route.query.from
        : '/dashboard';
    await router.replace(from);
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : t('login.invalidCredentials');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="login-layout">
    <div class="login-brand">
      <span class="brand-mark">{{ project.displayName.slice(0, 1) }}</span>
      <strong>{{ project.displayName }}</strong>
      <span>{{ t('app.console') }}</span>
    </div>
    <main class="login-main">
      <div class="login-form-wrap">
        <div class="login-icon"><LockKeyhole :size="21" /></div>
        <h1>{{ t('login.title') }}</h1>
        <p>{{ t('login.subtitle') }}</p>
        <form class="login-form" @submit.prevent="submit">
          <label for="login-email">{{ t('login.email') }}</label>
          <ElInput
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="username"
            required
          />
          <label for="login-password">{{ t('login.password') }}</label>
          <ElInput
            id="login-password"
            v-model="password"
            type="password"
            show-password
            autocomplete="current-password"
            required
          />
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
          <ElButton
            type="primary"
            native-type="submit"
            :loading="busy"
            class="login-submit"
          >
            {{ t('login.signIn') }} <ArrowRight v-if="!busy" :size="17" />
          </ElButton>
        </form>
        <div class="demo-accounts">
          <span>{{ t('app.localDemo') }}</span>
          <div>
            <ElButton @click="selectDemo('admin')">{{
              t('login.admin')
            }}</ElButton>
            <ElButton @click="selectDemo('viewer')">{{
              t('login.viewer')
            }}</ElButton>
          </div>
        </div>
      </div>
    </main>
    <footer class="login-footer">
      {{ project.displayName }} · {{ t('app.localDemo') }}
    </footer>
  </div>
</template>
