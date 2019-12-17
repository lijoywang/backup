"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dev;

var _webpackDevServer = _interopRequireDefault(require("webpack-dev-server"));

var _webpack = _interopRequireDefault(require("webpack"));

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require('debug')('plugins:');

const launchEditorMiddleware = require('launch-editor-middleware');

const portfinder = require('portfinder');

const path = require('path');

const fs = require('fs');

const _require = require('../../utils'),
      openBrowser = _require.openBrowser,
      prepareUrls = _require.prepareUrls;

const webpackHotDevClientPath = require.resolve('../../webpackHotDevClient.js');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const PROTOCOL = process.env.HTTPS ? 'https' : 'http';

const noop = () => {};

process.env.NODE_ENV = 'development';

function dev(opts = {}) {
  const cwd = opts.cwd,
        webpackConfig = opts.webpackConfig,
        beforeMiddlewares = opts.beforeMiddlewares,
        afterMiddlewares = opts.afterMiddlewares,
        beforeServer = opts.beforeServer,
        afterServer = opts.afterServer,
        contentBase = opts.contentBase,
        _opts$onCompileDone = opts.onCompileDone,
        onCompileDone = _opts$onCompileDone === void 0 ? noop : _opts$onCompileDone,
        proxy = opts.proxy,
        port = opts.port,
        base = opts.base,
        _opts$serverConfig = opts.serverConfig,
        serverConfigFromOpts = _opts$serverConfig === void 0 ? {} : _opts$serverConfig;
  portfinder.basePort = port || DEFAULT_PORT;
  portfinder.getPortPromise().then(port => {
    if (port === null) {
      return;
    }

    const devClients = [// hmr client
    webpackHotDevClientPath];
    addDevClientToEntry(webpackConfig, devClients);
    const compiler = (0, _webpack.default)(webpackConfig);
    let isFirstCompile = true;
    const SILENT = !!process.env.SILENT;
    const urls = prepareUrls(PROTOCOL, HOST, port, base); // make sound
    // ref: https://github.com/JannesMeyer/system-bell-webpack-plugin/blob/bb35caf/SystemBellPlugin.js#L14

    function makeSound() {
      process.stdout.write('\x07');
    }

    compiler.hooks.done.tap('webpackDevServer', stats => {
      if (stats.hasErrors()) {
        makeSound();
        return;
      }

      let folder = '';

      if (isFirstCompile && !SILENT) {
        if (process.env.HTML === 'none') {
          folder = getFolderFormEntry(webpackConfig, cwd);
        }

        console.log([`  App running at:`, `  - Local:   ${_chalk.default.cyan(`${urls.localUrlForTerminal}${folder}`)}`, `  - Network: ${_chalk.default.cyan(`${urls.lanUrlForTerminal}${folder}`)}`].join('\n'));
        console.log();
      }

      onCompileDone({
        isFirstCompile,
        stats
      });

      if (isFirstCompile) {
        isFirstCompile = false; // 开启自动打开浏览器

        process.env.OPEN_BROWER && openBrowser(`${urls.lanUrlForTerminal}${folder}`);
      }
    });

    const devServerConfig = _objectSpread({
      clientLogLevel: 'none',
      disableHostCheck: true,
      historyApiFallback: {
        disableDotRule: true
      },
      hot: true,
      quiet: true,
      compress: true,
      // gzip 压缩
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      publicPath: webpackConfig.output.publicPath,
      host: HOST,
      proxy,
      https: !!process.env.HTTPS,
      overlay: {
        warnings: false,
        errors: true
      },
      clientLogLevel: 'warning',
      contentBase: contentBase || process.env.CONTENT_BASE,

      before(app, server) {
        (beforeMiddlewares || []).forEach(middleware => {
          app.use(middleware);
        }); // 支持编辑器打开.

        app.use('/__open-in-editor', launchEditorMiddleware(() => console.log(`To specify an editor, sepcify the EDITOR env variable \n`)));
      },

      after(app) {
        (afterMiddlewares || []).forEach(middleware => {
          app.use(middleware);
        });
      }

    }, webpackConfig.devServer || {});

    debug('devServerConfig:', devServerConfig);
    const server = new _webpackDevServer.default(compiler, devServerConfig);
    [('SIGINT', 'SIGTERM')].forEach(signal => {
      process.on(signal, () => {
        server.close(() => {
          process.exit(0);
        });
      });
    });

    if (beforeServer) {
      beforeServer(server);
    }

    server.listen(port, HOST, err => {
      if (err) {
        console.log(err);
      }

      console.log(_chalk.default.cyan('Starting the development server...\n'));

      if (afterServer) {
        afterServer(server);
      }
    });
  }).catch(err => {
    console.log(err);
  });
} // inject dev & hot-reload middleware entries


function addDevClientToEntry(config, devClient) {
  const entry = config.entry;

  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach(key => {
      entry[key] = devClient.concat(entry[key]);
    });
  } else if (typeof entry === 'function') {
    entry = entry(devClient);
  } else {
    entry = devClient.concat(entry);
  }

  return entry;
}

function getFolderFormEntry(config, cwd) {
  const entry = config.entry;
  let entryDir = '';

  if (typeof entry === 'object' && !Array.isArray(entry)) {
    entryDir = Object.keys(entry)[0];
  }

  return entryDir;
}