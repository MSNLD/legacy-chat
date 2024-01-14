const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const webpack = require('webpack');
const path = require('path');

//const mode = 'development';
const mode = 'production';

module.exports = {
  devtool: false,
  mode: mode,
  entry: './src/ts/index.ts',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [{ loader: 'style-loader', options: { injectType: 'singletonStyleTag' } }, 'css-loader'],
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    iife: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Mono.Chat',
      template: './src/index.html',
      cache: false,
    }),
    new HtmlInlineScriptPlugin({
      scriptMatchPattern: [/.+\.js$/],
      htmlMatchPattern: [/index.html$/],
    }),
    {
      apply: (compiler) => {
        // There's probably a better way to do this, but we need to work with NN3/IE3, which support very basic JS
        const removableString = mode == 'production' ? 'var __webpack_exports__={};' : 'var __webpack_exports__ = {};';
        compiler.hooks.emit.tap('Emit', (compilation) => {
          const postBuildOutput = compilation.assets['index.html'].source();
          compilation.assets['index.html']._value = postBuildOutput
            // Remove __webpack_exports__ object (contains object literal notation)
            .replace(removableString, '')
            // Remove case sensitive comparison operators
            .replace(/([!=])==/g, '$1=');
        });
      },
    },
  ],
  optimization: {
    minimize: mode == 'production' ? true : false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: false,
        },
        extractComments: false,
      }),
    ],
  },
};
