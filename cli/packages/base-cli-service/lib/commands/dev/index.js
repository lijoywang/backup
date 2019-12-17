"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _dev = _interopRequireDefault(require("./dev"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api) {
  const service = api.service,
        log = api.log,
        debug = api.debug;
  const cwd = service.cwd;
  api.registerCommand('dev', {
    webpack: true,
    description: 'start a dev server for development'
  }, (args = {}) => {
    let server = null;
    const port = args.port;
    process.env.NODE_ENV = 'development';
    service.applyPlugins('onStart'); // Add service methods

    service.restart = why => {
      if (!server) {
        log.debug(`Server is not ready, ${chalk.underline.cyan('api.restart')} does not work.`);
        return;
      }

      if (why) {
        log.pending(`Since ${chalk.cyan.underline(why)}, try to restart server...`);
      } else {
        log.pending(`Try to restart server...`);
      }

      server.close();
      process.send({
        type: 'RESTART'
      });
    };

    service.refreshBrowser = () => {
      if (!server) return; // webpack-dev-server 暴露

      server.sockWrite(server.sockets, 'content-changed');
    };

    service.printError = messages => {
      if (!server) return;
      messages = typeof messages === 'string' ? [messages] : messages;
      server.sockWrite(server.sockets, 'errors', messages);
    };

    service.printWarn = messages => {
      if (!server) return;
      messages = typeof messages === 'string' ? [messages] : messages;
      server.sockWrite(server.sockets, 'warns', messages);
    };

    service.rebuildHTML = () => {
      // Currently, refresh browser will get new HTML.
      service.applyPlugins('onHTMLRebuild');
      service.refreshBrowser();
    };

    function startWatch() {}

    service._applyPluginsAsync('').then(() => {
      (0, _dev.default)({
        cwd,
        webpackConfig: service.webpackConfig,

        beforeServer(devServer) {
          server = devServer;
          service.applyPlugins('beforeDevServer', {
            args: {
              server: devServer
            }
          });
        },

        afterServer(devServer) {
          service.applyPlugins('afterDevServer', {
            args: {
              server: devServer
            }
          });
          startWatch();
        }

      });
    });
  });
}