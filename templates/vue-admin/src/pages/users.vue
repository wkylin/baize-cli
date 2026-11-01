<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ElButton,
  ElDialog,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
} from 'element-plus';
import { Pencil, Plus, Trash2 } from '@lucide/vue';
import StatusBadge from '../components/StatusBadge.vue';
import {
  userService,
  type User,
  type UserInput,
  type UserStatus,
} from '../services/users';
import type { Role } from '../services/auth';
import { usePreferencesStore } from '../stores/preferences';

const { t } = useI18n();
const preferences = usePreferencesStore();
const users = ref<User[]>([]);
const loading = ref(true);
const loadError = ref(false);
const search = ref('');
const role = ref<Role | 'all'>('all');
const status = ref<UserStatus | 'all'>('all');
const page = ref(1);
const dialogOpen = ref(false);
const editing = ref<User | null>(null);
const formError = ref('');
const draft = reactive<UserInput>({
  name: '',
  email: '',
  role: 'viewer',
  status: 'active',
});

const filtered = computed(() =>
  users.value.filter((user) => {
    const text = `${user.name} ${user.email}`.toLowerCase();
    return (
      text.includes(search.value.trim().toLowerCase()) &&
      (role.value === 'all' || user.role === role.value) &&
      (status.value === 'all' || user.status === status.value)
    );
  })
);
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * 8, page.value * 8)
);
watch([search, role, status], () => {
  page.value = 1;
});

async function refresh() {
  loading.value = true;
  loadError.value = false;
  try {
    users.value = await userService.list();
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(draft, {
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
  });
  formError.value = '';
  dialogOpen.value = true;
}

function openEdit(user: User) {
  editing.value = user;
  Object.assign(draft, {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });
  formError.value = '';
  dialogOpen.value = true;
}

async function save() {
  const name = draft.name.trim();
  const email = draft.email.trim();
  if (!name) {
    formError.value = t('users.nameRequired');
    return;
  }
  if (name.length > 30) {
    formError.value = t('users.nameMax');
    return;
  }
  if (!email) {
    formError.value = t('users.emailRequired');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formError.value = t('users.emailInvalid');
    return;
  }
  formError.value = '';
  try {
    await userService.save({ ...draft, name, email }, editing.value?.id);
    await refresh();
    dialogOpen.value = false;
    ElMessage.success(t(editing.value ? 'users.updated' : 'users.created'));
  } catch (cause) {
    formError.value =
      cause instanceof Error ? cause.message : t('users.saveError');
  }
}

async function remove(user: User) {
  try {
    await ElMessageBox.confirm(
      t('users.deleteDescription'),
      t('users.deleteConfirm', { name: user.name }),
      {
        confirmButtonText: t('users.delete'),
        cancelButtonText: t('users.cancel'),
        type: 'warning',
      }
    );
  } catch {
    return;
  }
  try {
    await userService.remove(user.id);
    await refresh();
    if (page.value > 1 && visible.value.length === 0) page.value -= 1;
    ElMessage.success(t('users.deleted'));
  } catch (cause) {
    ElMessage.error(
      cause instanceof Error ? cause.message : t('users.deleteError')
    );
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
  <section class="page users-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">{{ t('users.eyebrow') }}</p>
        <h1>{{ t('users.title') }}</h1>
        <p>{{ t('users.subtitle') }}</p>
      </div>
      <ElButton type="primary" @click="openCreate"
        ><Plus :size="17" />{{ t('users.add') }}</ElButton
      >
    </header>
    <div v-if="loadError" class="load-error" role="alert">
      {{ t('users.loadError') }}
      <ElButton link @click="refresh">{{ t('users.retry') }}</ElButton>
    </div>
    <div class="table-toolbar">
      <ElInput
        v-model="search"
        class="user-search"
        clearable
        :placeholder="t('users.search')"
        :aria-label="t('users.search')"
      />
      <ElSelect
        v-model="role"
        class="filter-select"
        :aria-label="t('users.role')"
      >
        <ElOption value="all" :label="t('users.allRoles')" />
        <ElOption value="admin" :label="t('role.admin')" />
        <ElOption value="viewer" :label="t('role.viewer')" />
      </ElSelect>
      <ElSelect
        v-model="status"
        class="filter-select"
        :aria-label="t('users.status')"
      >
        <ElOption value="all" :label="t('users.allStatuses')" />
        <ElOption value="active" :label="t('status.active')" />
        <ElOption value="inactive" :label="t('status.inactive')" />
      </ElSelect>
      <span class="table-count">{{
        t('users.count', { count: filtered.length })
      }}</span>
    </div>
    <div class="users-table">
      <ElTable
        :data="visible"
        v-loading="loading"
        :empty-text="t('users.noMatches')"
        table-layout="fixed"
      >
        <ElTableColumn :label="t('users.name')" min-width="220">
          <template #default="{ row }"
            ><div class="table-user">
              <span class="person-initial">{{ row.name.slice(0, 1) }}</span>
              <div>
                <strong>{{ row.name }}</strong
                ><span>{{ row.email }}</span>
              </div>
            </div></template
          >
        </ElTableColumn>
        <ElTableColumn :label="t('users.role')" width="140">
          <template #default="{ row }"
            ><ElTag
              :class="{ 'role-admin': row.role === 'admin' }"
              effect="plain"
            >
              {{ t(`role.${row.role}`) }}</ElTag
            ></template
          >
        </ElTableColumn>
        <ElTableColumn :label="t('users.status')" width="130">
          <template #default="{ row }"
            ><StatusBadge
              :status="row.status"
              :label="t(`status.${row.status}`)"
          /></template>
        </ElTableColumn>
        <ElTableColumn :label="t('users.createdAt')" width="140">
          <template #default="{ row }">{{ date(row.createdAt) }}</template>
        </ElTableColumn>
        <ElTableColumn :label="t('users.actions')" width="110" fixed="right">
          <template #default="{ row }"
            ><div class="table-actions">
              <ElTooltip :content="t('users.edit')"
                ><ElButton
                  text
                  class="icon-button"
                  :aria-label="t('users.editAria', { name: row.name })"
                  @click="openEdit(row as User)"
                  ><Pencil :size="16" /></ElButton
              ></ElTooltip>
              <ElTooltip :content="t('users.delete')"
                ><ElButton
                  text
                  class="icon-button danger"
                  :aria-label="t('users.deleteAria', { name: row.name })"
                  @click="remove(row as User)"
                  ><Trash2 :size="16" /></ElButton
              ></ElTooltip></div
          ></template>
        </ElTableColumn>
      </ElTable>
    </div>
    <ElPagination
      v-if="filtered.length > 8"
      v-model:current-page="page"
      class="table-pagination"
      :page-size="8"
      :total="filtered.length"
      background
      layout="prev, pager, next"
    />
    <ElDialog
      v-model="dialogOpen"
      :title="t(editing ? 'users.edit' : 'users.add')"
      width="min(480px, calc(100vw - 32px))"
    >
      <form class="user-form" @submit.prevent="save">
        <label for="user-name">{{ t('users.name') }}</label
        ><ElInput id="user-name" v-model="draft.name" maxlength="30" />
        <label for="user-email">{{ t('users.email') }}</label
        ><ElInput id="user-email" v-model="draft.email" type="email" />
        <label for="user-role">{{ t('users.role') }}</label>
        <ElSelect id="user-role" v-model="draft.role"
          ><ElOption value="admin" :label="t('role.admin')" /><ElOption
            value="viewer"
            :label="t('role.viewer')"
        /></ElSelect>
        <label for="user-status">{{ t('users.status') }}</label>
        <ElSelect id="user-status" v-model="draft.status"
          ><ElOption value="active" :label="t('status.active')" /><ElOption
            value="inactive"
            :label="t('status.inactive')"
        /></ElSelect>
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
        <div class="dialog-actions">
          <ElButton @click="dialogOpen = false">{{
            t('users.cancel')
          }}</ElButton>
          <ElButton type="primary" native-type="submit">{{
            t(editing ? 'users.saveChanges' : 'users.add')
          }}</ElButton>
        </div>
      </form>
    </ElDialog>
  </section>
</template>
