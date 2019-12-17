const webpack = require('webpack');
const merge = require('webpack-merge');
const MfwMultiHtmlWebpackPlugin = require('@mfw/multi-html-webpack-plugin');

const utils = require('./utils');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('../config');

const env = process.env.NODE_ENV || 'development';
const url = `http://${config[env].host}:${config[env].port}`;


const HOST = process.env.HOST;

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.development.cssSourceMap,
      usePostCSS: true,
    }),
  },
  devtool: '#source-map',
  output: {
    filename: '[name].[hash:7].js',
    path: config[env].assetsRoot,
    publicPath: config[env].assetsPublicPath,
    chunkFilename: '[name].js',
  },
  plugins: [
    new MfwMultiHtmlWebpackPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      // 引入 dll 生成的 manifest 文件
      manifest: utils.resolve('dll/vendor-manifest.json'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  // see https://www.webpackjs.com/configuration/dev-server/
  devServer: {
    hot: true,
    quiet: false,
    host: HOST || config.development.host,
    port: config[env].port,
    // #https://github.com/webpack/webpack-dev-server/issues/882
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
    inline: true,
    // 解决开发模式下 在子路由刷新返回 404 的情景
    historyApiFallback: utils.createHistoryApiRules(config[env].multipleEntry),
    stats: {
      colors: true,
      modules: false,
    },
    overlay: {
      warnings: false,
      errors: true
    },
    contentBase: config[env].contentBase,
    watchContentBase: true,
    publicPath: config[env].assetsPublicPath,
  },
});