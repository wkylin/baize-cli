import type { Meta, StoryObj } from '@storybook/vue3-vite';
import RemotePage from './RemotePage.vue';

const meta = {
  title: 'Reports/Overview',
  component: RemotePage,
} satisfies Meta<typeof RemotePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
