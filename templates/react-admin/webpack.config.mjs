import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const root = path.dirname(fileURLToPath(import.meta.url));

export default (_env, argv) => {
  const production = argv.mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: path.join(root, 'src', 'main.tsx'),
    output: {
      path: path.join(root, 'dist'),
      filename: production
        ? 'assets/[name].[contenthash].js'
        : 'assets/[name].js',
      publicPath: '/',
      clean: true,
    },
    resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'esbuild-loader',
          options: { loader: 'tsx', target: 'es2022', jsx: 'automatic' },
        },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.join(root, 'index.html') }),
      new CopyWebpackPlugin({
        patterns: [{ from: path.join(root, 'public'), to: '.' }],
      }),
      new webpack.DefinePlugin({ __APP_BUNDLER__: JSON.stringify('webpack') }),
    ],
    devtool: production ? 'source-map' : 'eval-cheap-module-source-map',
    devServer: {
      port: Number(process.env.PORT || 5173),
      historyApiFallback: true,
      static: path.join(root, 'public'),
      hot: true,
    },
    performance: { hints: false },
  };
};
