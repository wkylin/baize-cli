<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { code = 404 } = defineProps<{ code?: 403 | 404 }>();
const { t } = useI18n();
const forbidden = computed(() => code === 403);
</script>

<template>
  <section class="page error-page">
    <span class="error-code">{{ code }}</span>
    <h1>{{ t(forbidden ? 'app.forbiddenTitle' : 'app.missingTitle') }}</h1>
    <p>{{ t(forbidden ? 'app.forbiddenHint' : 'app.missingHint') }}</p>
  </section>
</template>
