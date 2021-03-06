"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _webpack = _interopRequireDefault(require("webpack"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _FileSizeReporter = require("react-dev-utils/FileSizeReporter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _require = require('../../utils'),
      info = _require.info,
      done = _require.done,
      stopSpinner = _require.stopSpinner;

const debug = require('debug')('webpack:build'); // These sizes are pretty large. We'll warn for bundles exceeding them.


const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

function build(opts = {}) {
  const webpackConfig = opts.webpackConfig,
        _opts$cwd = opts.cwd,
        cwd = _opts$cwd === void 0 ? process.cwd() : _opts$cwd,
        onSuccess = opts.onSuccess,
        onFail = opts.onFail;
  debug(`Clean output path ${webpackConfig.output.path.replace(`${cwd}/`, '')}`);

  _rimraf.default.sync(webpackConfig.output.path);

  debug('build start');
  (0, _webpack.default)(webpackConfig, (err, stats) => {
    debug('build done');
    stopSpinner(false);

    if (err || stats.hasErrors()) {
      if (onFail) {
        onFail({
          err,
          stats
        });
      }

      process.exit(1);
    }

    console.log('File sizes after gzip:\n');
    (0, _FileSizeReporter.printFileSizesAfterBuild)(stats, {
      root: webpackConfig.output.path,
      sizes: {}
    }, webpackConfig.output.path, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
    console.log();

    if (onSuccess) {
      onSuccess({
        stats
      });
    }
  });
}