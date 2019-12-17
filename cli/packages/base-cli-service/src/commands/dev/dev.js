import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import chalk from 'chalk';

const debug = require('debug')('plugins:');
const launchEditorMiddleware = require('launch-editor-middleware');
const portfinder = require('portfinder');
const path = require('path');
const fs = require('fs');
const { openBrowser, prepareUrls } = require('../../utils');
const webpackHotDevClientPath = require.resolve('../../webpackHotDevClient.js');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const PROTOCOL = process.env.HTTPS ? 'https' : 'http';
const noop = () => {};

process.env.NODE_ENV = 'development';

export default function dev(opts = {}) {
  const {
    cwd,
    webpackConfig,
    beforeMiddlewares,
    afterMiddlewares,
    beforeServer,
    afterServer,
    contentBase,
    onCompileDone = noop,
    proxy,
    port,
    base,
    serverConfig: serverConfigFromOpts = {},
  } = opts;
  portfinder.basePort = port || DEFAULT_PORT;
  portfinder
    .getPortPromise()
    .then((port) => {
      if (port === null) {
        return;
      }
      const devClients = [
        // hmr client
        webpackHotDevClientPath,
        // require.resolve('webpack/hot/dev-server'),
      ];
      addDevClientToEntry(webpackConfig, devClients);
      const compiler = webpack(webpackConfig);
      let isFirstCompile = true;
      const SILENT = !!process.env.SILENT;
      const urls = prepareUrls(PROTOCOL, HOST, port, base);
      // make sound
      // ref: https://github.com/JannesMeyer/system-bell-webpack-plugin/blob/bb35caf/SystemBellPlugin.js#L14
      function makeSound() {
        process.stdout.write('\x07');
      }
      compiler.hooks.done.tap('webpackDevServer', (stats) => {
        if (stats.hasErrors()) {
          makeSound();
          return;
        }
        let folder = '';
        if (isFirstCompile && !SILENT) {
          if (process.env.HTML === 'none') {
            folder = getFolderFormEntry(webpackConfig, cwd);
          }
          console.log(
            [
              `  App running at:`,
              `  - Local:   ${chalk.cyan(
                `${urls.localUrlForTerminal}${folder}`
              )}`,
              `  - Network: ${chalk.cyan(
                `${urls.lanUrlForTerminal}${folder}`
              )}`,
            ].join('\n')
          );
          console.log();
        }

        onCompileDone({
          isFirstCompile,
          stats,
        });

        if (isFirstCompile) {
          isFirstCompile = false;
          // 开启自动打开浏览器
          process.env.OPEN_BROWER &&
            openBrowser(`${urls.lanUrlForTerminal}${folder}`);
        }
      });

      const devServerConfig = {
        clientLogLevel: 'none',
        disableHostCheck: true,
        historyApiFallback: {
          disableDotRule: true,
        },
        hot: true,
        quiet: true,
        compress: true, // gzip 压缩
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'Origin, X-Requested-With, Content-Type, Accept',
        },
        publicPath: webpackConfig.output.publicPath,
        host: HOST,
        proxy,
        https: !!process.env.HTTPS,
        overlay: { warnings: false, errors: true },
        clientLogLevel: 'warning',
        contentBase: contentBase || process.env.CONTENT_BASE,
        before(app, server) {
          (beforeMiddlewares || []).forEach((middleware) => {
            app.use(middleware);
          });
          // 支持编辑器打开.
          app.use(
            '/__open-in-editor',
            launchEditorMiddleware(() =>
              console.log(
                `To specify an editor, sepcify the EDITOR env variable \n`
              )
            )
          );
        },
        after(app) {
          (afterMiddlewares || []).forEach((middleware) => {
            app.use(middleware);
          });
        },
        ...(webpackConfig.devServer || {}),
      };

      debug('devServerConfig:', devServerConfig);
      const server = new WebpackDevServer(compiler, devServerConfig);
      [('SIGINT', 'SIGTERM')].forEach((signal) => {
        process.on(signal, () => {
          server.close(() => {
            process.exit(0);
          });
        });
      });

      if (beforeServer) {
        beforeServer(server);
      }

      server.listen(port, HOST, (err) => {
        if (err) {
          console.log(err);
        }
        console.log(chalk.cyan('Starting the development server...\n'));
        if (afterServer) {
          afterServer(server);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

// inject dev & hot-reload middleware entries
function addDevClientToEntry(config, devClient) {
  const { entry } = config;
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach((key) => {
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
  const { entry } = config;
  let entryDir = '';
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    entryDir = Object.keys(entry)[0];
  }
  return entryDir;
}
