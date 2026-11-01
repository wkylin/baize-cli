<script setup lang="ts">
import { computed } from 'vue';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { usePreferencesStore } from '../stores/preferences';

const preferences = usePreferencesStore();
const locale = computed(() => (preferences.language === 'zh' ? zhCn : en));
const size = computed(() =>
  preferences.density === 'compact' ? 'small' : 'default'
);
</script>

<template>
  <ElConfigProvider :locale="locale" :size="size">
    <RouterView />
  </ElConfigProvider>
</template>
