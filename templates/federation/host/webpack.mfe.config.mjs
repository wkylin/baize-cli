import webpack from 'webpack';
import base from './webpack.config.mjs';

export default (env, argv) => {
  const config = base(env, argv);
  config.output.publicPath = 'auto';
  config.output.uniqueName = 'shell';
  config.plugins.push(new webpack.container.ModuleFederationPlugin({
    name: 'shell',
    remotes: { reports: `reports@${process.env.BAIZE_REMOTE_URL || 'http://localhost:5174/remoteEntry.js'}` },
    shared: {
      react: { singleton: true, eager: true, requiredVersion: '19.3.1' },
      'react-dom': { singleton: true, eager: true, requiredVersion: '19.3.1' },
    },
  }));
  return config;
};
