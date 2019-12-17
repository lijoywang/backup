const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackInlineManifestPlugin = require('webpack-inline-manifest-plugin');
const MfwMultiHtmlWebpackPlugin = require('@mfw/multi-html-webpack-plugin');
const utils = require('./utils');
const baseWebpackConfig = require('./webpack.base.config');
const config = require('../config');

const env = process.env.NODE_ENV || 'development';
const matchVendorsChunk = /vue|vue-router|axios|async-await-error-handling|mobx|vue-mobx|vuex/;

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.production.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  output: {
    filename: utils.assetsPath('js/[name].[contenthash:8].js'),
    path: config[env].assetsRoot,
    publicPath: config[env].assetsPublicPath,
    chunkFilename: utils.assetsPath('js/[name].[contenthash:8].js'),
  },
  optimization: {
    minimize: true, // false 则不压缩
    // chunk for the webpack runtime code and chunk manifest
    runtimeChunk: {
      name: 'manifest'
    },
    // https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
    splitChunks: {
      cacheGroups: {
        // default: false, // 禁止默认的优化
        // vendors: {
        //   test(chunk) {
        //     return (
        //       chunk.context.includes('node_modules') &&
        //       matchVendorsChunk.test(chunk.context)
        //     );
        //   },
        //   name: 'vendors',
        //   chunks: 'all'
        // },
        commons: {
          // 抽取 demand-chunk 下的公共依赖模块
          name: 'commons',
          minChunks: 2, // 在chunk中最小的被引用次数
          chunks: 'async',
          minSize: 0 // 被提取模块的最小大小
        }
      }
    }
  },
  devtool: config[env].productionSourceMap ? '#source-map' : false,
  plugins: [
    new MfwMultiHtmlWebpackPlugin({
      filename: 'html/{{foldername}}/index.html',
      chunks: ['commons']
    }),
    new CleanWebpackPlugin(['public'], {
      root: path.join(__dirname, '..')
    }),

    new webpack.HashedModuleIdsPlugin(),

    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash:8].css')
    }),

    new OptimizeCSSPlugin({
      parser: require('postcss-safe-parser'),
      discardComments: {
        removeAll: true
      }
    }),

    new UglifyJsPlugin({
      parallel: true,
      cache: true,
      sourceMap: false,
      uglifyOptions: {
        compress: config[env].hasConsole ? {
          //warnings: false,
          /* eslint-disable */
          drop_debugger: true,
          drop_console: true
        } : {},
        mangle: false
      }
    }),

    new WebpackInlineManifestPlugin({
      name: 'webpackManifest'
    }),
  ]
});

if (config.production.productionGzip) {
  // gzip
  const CompressionWebpackPlugin = require('compression-webpack-plugin');
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' + config.production.productionGzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  );
}

if (config.production.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;