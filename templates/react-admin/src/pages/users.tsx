import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from 'antd';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  userService,
  type User,
  type UserInput,
  type UserStatus,
} from '../services/users';
import type { Role } from '../services/auth';
import { StatusBadge } from '../components/StatusBadge';

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [status, setStatus] = useState<UserStatus | 'all'>('all');
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<UserInput>();
  const [messageApi, contextHolder] = message.useMessage();

  async function refresh() {
    setLoading(true);
    setLoadError('');
    try {
      setUsers(await userService.list());
    } catch {
      setLoadError('users.loadError');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesText = `${user.name} ${user.email}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        return (
          matchesText &&
          (role === 'all' || user.role === role) &&
          (status === 'all' || user.status === status)
        );
      }),
    [users, search, role, status]
  );

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'viewer', status: 'active' });
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setModalOpen(true);
  }

  async function save(input: UserInput) {
    try {
      await userService.save(input, editing?.id);
      await refresh();
      setModalOpen(false);
      messageApi.success(t(editing ? 'users.updated' : 'users.created'));
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : t('users.saveError')
      );
    }
  }

  async function remove(id: string) {
    try {
      await userService.remove(id);
      await refresh();
      messageApi.success(t('users.deleted'));
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : t('users.deleteError')
      );
    }
  }

  const columns: TableColumnsType<User> = [
    {
      title: t('users.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, user) => (
        <div className="table-user">
          <span className="person-initial">{user.name.slice(0, 1)}</span>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: t('users.role'),
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (value: Role) => (
        <Tag className={value === 'admin' ? 'role-admin' : ''}>
          {t(`role.${value}`)}
        </Tag>
      ),
    },
    {
      title: t('users.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (value: UserStatus) => (
        <StatusBadge status={value} label={t(`status.${value}`)} />
      ),
    },
    {
      title: t('users.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (value: string) =>
        new Date(value).toLocaleDateString(
          i18n.language === 'en' ? 'en-US' : 'zh-CN'
        ),
    },
    {
      title: t('users.actions'),
      key: 'actions',
      width: 110,
      render: (_, user) => (
        <Space size={2}>
          <Tooltip title={t('users.editTooltip')}>
            <Button
              type="text"
              icon={<Pencil size={16} />}
              aria-label={t('users.editAria', { name: user.name })}
              onClick={() => openEdit(user)}
            />
          </Tooltip>
          <Popconfirm
            title={t('users.deleteConfirm', { name: user.name })}
            description={t('users.deleteDescription')}
            okText={t('users.delete')}
            cancelText={t('users.cancel')}
            onConfirm={() => remove(user.id)}
          >
            <Tooltip title={t('users.deleteTooltip')}>
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                aria-label={t('users.deleteAria', { name: user.name })}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className="page users-page">
      {contextHolder}
      <header className="page-heading">
        <div>
          <p className="eyebrow">{t('users.eyebrow')}</p>
          <h1>{t('users.title')}</h1>
          <p>{t('users.subtitle')}</p>
        </div>
        <Button type="primary" icon={<Plus size={17} />} onClick={openCreate}>
          {t('users.add')}
        </Button>
      </header>
      {loadError && (
        <div className="load-error" role="alert">
          {t(loadError)}{' '}
          <Button type="link" onClick={refresh}>
            {t('users.retry')}
          </Button>
        </div>
      )}
      <div className="table-toolbar">
        <Input
          className="user-search"
          prefix={<Search size={16} />}
          placeholder={t('users.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          aria-label={t('users.searchAria')}
        />
        <Select
          value={role}
          onChange={setRole}
          aria-label={t('users.filterRole')}
          options={[
            { value: 'all', label: t('users.allRoles') },
            { value: 'admin', label: t('role.admin') },
            { value: 'viewer', label: t('role.viewer') },
          ]}
        />
        <Select
          value={status}
          onChange={setStatus}
          aria-label={t('users.filterStatus')}
          options={[
            { value: 'all', label: t('users.allStatuses') },
            { value: 'active', label: t('status.active') },
            { value: 'inactive', label: t('status.inactive') },
          ]}
        />
        <span className="table-count">
          {t('users.count', { count: filtered.length })}
        </span>
      </div>
      <Table<User>
        className="users-table"
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        scroll={{ x: 760 }}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        locale={{ emptyText: t('users.noMatches') }}
      />
      <Modal
        title={t(editing ? 'users.edit' : 'users.add')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={t(editing ? 'users.saveChanges' : 'users.add')}
        cancelText={t('users.cancel')}
        forceRender
      >
        <Form<UserInput>
          form={form}
          layout="vertical"
          onFinish={save}
          requiredMark={false}
          className="user-form"
        >
          <Form.Item
            name="name"
            label={t('users.name')}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('users.nameRequired'),
              },
              { max: 30, message: t('users.nameMax') },
            ]}
          >
            <Input placeholder={t('users.name')} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('users.email')}
            rules={[
              { required: true, message: t('users.emailRequired') },
              { type: 'email', message: t('users.emailInvalid') },
            ]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>
          <Form.Item
            name="role"
            label={t('users.role')}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'admin', label: t('role.admin') },
                { value: 'viewer', label: t('role.viewer') },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label={t('users.status')}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'active', label: t('status.active') },
                { value: 'inactive', label: t('status.inactive') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
