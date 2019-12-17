"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _build = _interopRequireDefault(require("./build"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _require = require('../../utils'),
      info = _require.info,
      done = _require.done,
      logWithSpinner = _require.logWithSpinner;

function _default(api) {
  const service = api.service,
        log = api.log,
        debug = api.debug;
  const cwd = service.cwd,
        mode = service.mode;
  api.registerCommand('build', {
    webpack: true
  }, (args = {}) => {
    let server = null;
    const port = args.port;
    process.env.NODE_ENV = 'production';
    service.applyPlugins('onStart');
    logWithSpinner(`Building for ${mode}...`);
    return new Promise((resolve, reject) => {
      return (0, _build.default)({
        cwd,
        webpackConfig: service.webpackConfig,

        onSuccess({
          stats
        }) {
          debug('Build success');
          service.applyPlugins('onBuildSuccess', {
            args: {
              stats
            }
          });
          debug('Build success end');
          resolve();
        },

        onFail({
          err,
          stats
        }) {
          service.applyPlugins('onBuildFail', {
            args: {
              err,
              stats
            }
          });
          reject(err);
        }

      });
    });
  });
}