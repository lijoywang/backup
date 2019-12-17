const { join, extname, basename, dirname } = require('path');

/**
 *
 *
 * @param {pluginAPI} api
 * @param {object} [options]
 * {
 *  basePath: [string],
 *  domain: [string],
 *  proxy: [string]
 *  }
 */
module.exports = function(api, options = {}) {
  const { log } = api;
  const { basePath, domain, proxy } = options;
  const isDev = process.env.NODE_ENV === 'development';
  const IS_DEV = process.env.IS_DEV;
  const GROUP_NAME =
    process.env.npm_config_group_name || 'cannot_find_group_name';
  const SERVER_NAME =
    process.env.npm_config_server_name || 'cannot_find_server_name';
  const MICRO_BASE = `${GROUP_NAME}/${SERVER_NAME}`;
  const PROD_BASE = basePath || MICRO_BASE;
  const HOST = IS_DEV ? 'svc.mfwdev.com' : 'wpstatic.mafengwo.net';
  const BASE_PATH = IS_DEV ? MICRO_BASE : PROD_BASE;
  const PUBLIC_PATH = `https://${HOST}/${MICRO_BASE}/`;

  api.chainWebpackConfig((webpackConfig) => {
    webpackConfig.plugin('define').tap((arg) => {
      arg[0] = {
        ...arg[0],
        'window.ROUTER_BASE': isDev
          ? JSON.stringify('')
          : JSON.stringify(BASE_PATH),
        'window.DOMAIN': JSON.stringify(
          IS_DEV || isDev ? 'mfwdev.com' : domain || 'mafengwo.cn'
        ),
        'window.IS_DEV': JSON.stringify(IS_DEV || isDev),
      };
      return arg;
    });
    if (!isDev) {
      webpackConfig.output.publicPath(PUBLIC_PATH);
    }
  });
};
