"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _uglifyjsWebpackPlugin = _interopRequireDefault(require("uglifyjs-webpack-plugin"));

var _lodash = require("lodash");

var _uglifyOptions = _interopRequireDefault(require("./uglifyOptions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// import terserOptions from './terserOptions';
function mergeConfig(config, userConfig) {
  if (typeof userConfig === 'function') {
    return userConfig(config);
  } else if ((0, _lodash.isPlainObject)(userConfig)) {
    return _objectSpread({}, config, userConfig);
  } else {
    return config;
  }
}

function _default(webpackConfig, opts) {
  webpackConfig.mode('production').devtool(opts.devtool);
  webpackConfig.performance.hints(false);
  webpackConfig.optimization // don't emit files if have error
  .noEmitOnErrors(true);
  webpackConfig.output.filename(`js/[name].[chunkhash:8].js`).chunkFilename(`js/[name].[chunkhash:8].async.js`);
  webpackConfig.plugin('hash-module-ids').use(require('webpack/lib/HashedModuleIdsPlugin'));

  if (opts.manifest) {
    webpackConfig.plugin('manifest').use(require('webpack-manifest-plugin'), [_objectSpread({
      fileName: 'asset-manifest.json'
    }, opts.manifest)]);
  }

  let minimizerName = 'uglifyjs';
  let minimizerPlugin = _uglifyjsWebpackPlugin.default;
  let minimizerOptions = [mergeConfig(_objectSpread({}, _uglifyOptions.default, {
    sourceMap: !!opts.devtool
  }), opts.uglifyJSOptions)];

  if (opts.minimizer === 'terserjs') {
    minimizerName = 'terserjs';
    minimizerPlugin = TerserPlugin;
    minimizerOptions = [mergeConfig(_objectSpread({}, terserOptions, {
      sourceMap: !!opts.devtool
    }), opts.terserJSOptions)];
  }

  webpackConfig.optimization.minimizer(minimizerName).use(minimizerPlugin, minimizerOptions);
}