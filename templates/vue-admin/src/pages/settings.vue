<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElButton, ElInput, ElMessage, ElSegmented } from 'element-plus';
import { Check, Save } from '@lucide/vue';
import {
  accentColors,
  usePreferencesStore,
  type Preferences,
} from '../stores/preferences';

const { t } = useI18n();
const preferences = usePreferencesStore();
const draft = reactive<Preferences>({
  workspaceName: preferences.workspaceName,
  themeMode: preferences.themeMode,
  accentColor: preferences.accentColor,
  density: preferences.density,
  language: preferences.language,
});
const error = ref('');
const themeOptions = computed(() => [
  { label: t('settings.system'), value: 'system' },
  { label: t('settings.light'), value: 'light' },
  { label: t('settings.dark'), value: 'dark' },
]);
const densityOptions = computed(() => [
  { label: t('settings.comfortable'), value: 'comfortable' },
  { label: t('settings.compact'), value: 'compact' },
]);
const languageOptions = computed(() => [
  { label: t('settings.chinese'), value: 'zh' },
  { label: t('settings.english'), value: 'en' },
]);

function save() {
  const name = draft.workspaceName.trim();
  if (!name) {
    error.value = t('settings.nameRequired');
    return;
  }
  if (name.length > 30) {
    error.value = t('settings.nameMax');
    return;
  }
  error.value = '';
  preferences.save({ ...draft, workspaceName: name });
  draft.workspaceName = preferences.workspaceName;
  ElMessage.success(t('settings.saved'));
}
</script>

<template>
  <section class="page settings-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">{{ t('settings.eyebrow') }}</p>
        <h1>{{ t('settings.title') }}</h1>
        <p>{{ t('settings.subtitle') }}</p>
      </div>
    </header>
    <form class="settings-form" @submit.prevent="save">
      <div class="setting-row">
        <div>
          <h2>{{ t('settings.workspaceName') }}</h2>
          <p>{{ t('settings.workspaceHint') }}</p>
        </div>
        <div>
          <ElInput
            v-model="draft.workspaceName"
            maxlength="30"
            :placeholder="t('settings.workspaceName')"
          />
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <h2>{{ t('settings.theme') }}</h2>
          <p>{{ t('settings.appearanceHint') }}</p>
        </div>
        <ElSegmented v-model="draft.themeMode" :options="themeOptions" />
      </div>
      <div class="setting-row">
        <div>
          <h2>{{ t('settings.accent') }}</h2>
        </div>
        <div
          class="accent-swatches"
          role="group"
          :aria-label="t('settings.accent')"
        >
          <button
            v-for="color in accentColors"
            :key="color"
            type="button"
            class="accent-swatch"
            :style="{ backgroundColor: color }"
            :aria-label="`${t('settings.accent')} ${color}`"
            :aria-pressed="draft.accentColor === color"
            @click="draft.accentColor = color"
          >
            <Check
              v-if="draft.accentColor === color"
              :size="17"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <h2>{{ t('settings.density') }}</h2>
        </div>
        <ElSegmented v-model="draft.density" :options="densityOptions" />
      </div>
      <div class="setting-row">
        <div>
          <h2>{{ t('settings.language') }}</h2>
        </div>
        <ElSegmented v-model="draft.language" :options="languageOptions" />
      </div>
      <div class="settings-actions">
        <ElButton type="primary" native-type="submit"
          ><Save :size="16" />{{ t('settings.save') }}</ElButton
        >
      </div>
    </form>
  </section>
</template>
