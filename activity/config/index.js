const path = require('path');
const myIP = require('my-ip');

const IS_DEV = process.env.IS_DEV;
const GROUP_NAME = process.env.npm_config_group_name || 'cannot_find_group_name';
const SERVER_NAME = process.env.npm_config_server_name || 'cannot_find_server_name';
const PROD_BASE = 'mc/activity/';
const MICRO_BASE = `${GROUP_NAME}/${SERVER_NAME}/`;
const HOST = IS_DEV ? 'svc.mfwdev.com' : 'wpstatic.mafengwo.net';
const BASE_PATH = IS_DEV ? MICRO_BASE : PROD_BASE;
const PUBLIC_PATH = `https://${HOST}/${MICRO_BASE}`;

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

module.exports = {
  development: {
    curEnv: 'dev_local',
    assetsRoot: resolve('public'),
    assetsPublicPath: '/',
    assetsSubDirectory: 'static',
    contentBase: resolve('public'),
    host: '0.0.0.0',
    port: 8080,
    prefix: 'm',
    domain: 'mfwdev.com',
    historyBasePath: '',
    ip: myIP(),
    /**
     * Source Maps
     */
    cssSourceMap: true,
    multipleEntry: {
      root: resolve('src/pages'),
      page: process.env.NODE_PACKAGE || '', // 单一文件夹
      file: '**/main.js', // 入口文件
      static: '',
      exclude: ''
    }
  },
  production: {
    curEnv: IS_DEV ? 'dev_micro' : 'prod',
    assetsRoot: resolve('public'),
    assetsPublicPath: PUBLIC_PATH,
    assetsSubDirectory: '',
    prefix: 'm',
    domain: 'mafengwo.cn',
    historyBasePath: BASE_PATH,
    /**
     * Source Maps
     */
    productionSourceMap: IS_DEV,
    hasConsole: !IS_DEV,

    multipleEntry: {
      root: resolve('src/pages'),
      page: process.env.NODE_PACKAGE || '', // 单一文件夹
      file: '**/main.js', // 入口文件
      static: 'html',
      exclude: /_backup/ig
    },
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
};
