import type { Meta, StoryObj } from '@storybook/react';
import { WuiCodeInput } from './WuiCodeInput';

const meta = {
  title: 'WUI/One-time passcode',
  component: WuiCodeInput,
} satisfies Meta<typeof WuiCodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
