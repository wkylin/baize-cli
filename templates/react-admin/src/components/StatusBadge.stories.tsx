import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

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
