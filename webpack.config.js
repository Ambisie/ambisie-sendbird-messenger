'use strict';

/* global __dirname, process */
const path              = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Visualizer        = require('webpack-visualizer-plugin');

module.exports = () => {
  const config = {
    entry: {
      messenger: ['./src/scss/main.scss', './src/js/main.js']
    },
    output: {
      path         : path.resolve(__dirname, './dist'),
      filename     : 'ambisie-[name].js',
      library      : 'AmbisieMessenger',
      libraryExport: 'default',
      libraryTarget: 'umd',
      publicPath   : 'dist'
    },
    externals: {
      lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_',
      },
      moment: {
        commonjs : 'moment',
        commonjs2: 'moment',
        amd      : 'moment',
        root     : 'moment',
      }
    },
    devtool: 'cheap-eval-source-map',
    devServer: {
      publicPath      : '/dist/',
      contentBase     : path.resolve(__dirname, './test/server/'),
      disableHostCheck: true,
      host            : '0.0.0.0',
      compress        : true,
      port            : 9000
    },
    module: {
      rules: [
        {
          // SCSS
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[local]',
                  },
                  // sourceMap: true
                }
              },
              {
                loader: 'sass-loader'
              }
            ]
          })
        },
        {
          // ESLint
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: { failOnError: true }
        },
        {
          // ES6
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: '/node_modules/'
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin({
        filename: 'ambisie-[name].css'
      }),
      // new Visualizer({ filename: 'webpack-stats.html'})
    ]
  };

  return config;
};
