<script setup lang="ts">
import { defineAsyncComponent, onErrorCaptured, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElButton } from 'element-plus';

const { t } = useI18n();
const failed = ref(false);
const RemotePage = defineAsyncComponent(() => import('reports/RemotePage'));

onErrorCaptured(() => {
  failed.value = true;
  return false;
});

function retry() {
  window.location.reload();
}
</script>

<template>
  <section v-if="failed" class="page error-page">
    <h1>{{ t('remote.unavailable') }}</h1>
    <p>{{ t('remote.hint') }}</p>
    <ElButton @click="retry">{{ t('remote.retry') }}</ElButton>
  </section>
  <Suspense v-else>
    <RemotePage />
    <template #fallback
      ><div class="page-loading">{{ t('remote.loading') }}</div></template
    >
  </Suspense>
</template>
