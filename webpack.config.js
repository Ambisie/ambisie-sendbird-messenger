'use strict';

/* global __dirname, process */
const path              = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PRODUCTION = 'production';

module.exports = () => {
  const config = {
    entry: {
      messenger: ['./src/js/main.js', './src/scss/main.scss']
    },
    output: {
      path         : path.resolve(__dirname, './dist'),
      filename     : 'ambisie.[name].js',
      library      : '[name]',
      libraryExport: 'default',
      libraryTarget: 'umd',
      publicPath   : 'dist'
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
                  module: true,
                  minimize: process.env.WEBPACK_MODE === PRODUCTION,
                  // sourceMap: true,
                  localIdentName: '[local]'
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
        filename: 'ambisie.[name].css'
      })
    ]
  };

  return config;
};
