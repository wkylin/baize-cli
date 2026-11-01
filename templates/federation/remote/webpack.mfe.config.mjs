import webpack from 'webpack';
import base from './webpack.config.mjs';

export default (env, argv) => {
  const config = base(env, argv);
  config.output.publicPath = 'auto';
  config.output.uniqueName = 'reports';
  config.devServer.headers = { 'Access-Control-Allow-Origin': '*' };
  config.plugins.push(
    new webpack.container.ModuleFederationPlugin({
      name: 'reports',
      filename: 'remoteEntry.js',
      library: { type: 'var', name: 'reports' },
      exposes: { './RemotePage': './src/RemotePage.tsx' },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '19.3.1' },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '19.3.1',
        },
      },
    })
  );
  return config;
};
