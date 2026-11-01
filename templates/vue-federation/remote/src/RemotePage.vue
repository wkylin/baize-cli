<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { reportLanguage } from './language';
import './styles.css';

const copy = {
  zh: {
    eyebrow: '报表',
    title: '报表中心',
    description: '这个页面由独立远端应用提供，可以单独开发、构建和部署。',
    visits: '今日访问',
    pending: '待处理事项',
    completion: '完成率',
  },
  en: {
    eyebrow: 'Reports',
    title: 'Reports overview',
    description: 'This page is served by an independent remote application.',
    visits: 'Visits today',
    pending: 'Pending items',
    completion: 'Completion rate',
  },
};
const language = ref(reportLanguage(document.documentElement.lang));
const text = computed(() => copy[language.value]);
let observer: MutationObserver | undefined;

onMounted(() => {
  observer = new MutationObserver(() => {
    language.value = reportLanguage(document.documentElement.lang);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
});
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <section class="remote-page">
    <header class="remote-page__header">
      <p class="remote-page__eyebrow">{{ text.eyebrow }}</p>
      <h1>{{ text.title }}</h1>
      <p>{{ text.description }}</p>
    </header>
    <div class="remote-page__metrics">
      <div>
        <span>{{ text.visits }}</span
        ><strong>1,284</strong>
      </div>
      <div>
        <span>{{ text.pending }}</span
        ><strong>18</strong>
      </div>
      <div>
        <span>{{ text.completion }}</span
        ><strong>92%</strong>
      </div>
    </div>
  </section>
</template>
