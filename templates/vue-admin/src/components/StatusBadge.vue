<script setup lang="ts">
import type { UserStatus } from '../services/users';

defineProps<{ status: UserStatus; label: string }>();
</script>

<template>
  <span class="status-label" :class="{ inactive: status === 'inactive' }">{{
    label
  }}</span>
</template>
