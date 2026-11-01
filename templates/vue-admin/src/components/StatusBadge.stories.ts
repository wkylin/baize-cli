import type { Meta, StoryObj } from '@storybook/vue3-vite';
import StatusBadge from './StatusBadge.vue';

const meta = {
  title: 'Admin/Status badge',
  component: StatusBadge,
  args: { status: 'active', label: 'Active' },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};
export const Inactive: Story = {
  args: { status: 'inactive', label: 'Inactive' },
};
