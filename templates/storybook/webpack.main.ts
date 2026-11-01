import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-webpack5';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/react-webpack5',
  staticDirs: ['../public'],
  webpackFinal: async (webpackConfig) => {
    webpackConfig.module ??= { rules: [] };
    webpackConfig.module.rules ??= [];
    webpackConfig.module.rules.push({
      test: /\.[jt]sx?$/,
      include: [path.join(root, 'src'), path.join(root, '.storybook')],
      loader: 'esbuild-loader',
      options: { loader: 'tsx', target: 'es2022', jsx: 'automatic' },
    });
    return webpackConfig;
  },
};

export default config;
