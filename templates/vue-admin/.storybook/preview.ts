import type { Preview } from '@storybook/vue3-vite';
import 'element-plus/dist/index.css';
import '../src/styles.css';

const preview: Preview = {
  parameters: { layout: 'centered' },
};

export default preview;
