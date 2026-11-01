import type { Meta, StoryObj } from '@storybook/react';
import RemotePage from './RemotePage';

const meta = {
  title: 'Reports/Overview',
  component: RemotePage,
} satisfies Meta<typeof RemotePage>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
