"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _getConfig = _interopRequireDefault(require("./getConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(service) {
  const config = service.config;

  const webpackOpts = _objectSpread({
    cwd: service.cwd
  }, config, {
    chainConfig: webpackConfig => {
      service.applyPlugins('chainWebpackConfig', {
        args: webpackConfig
      });

      if (config.chainWebpack) {
        config.chainWebpack(webpackConfig, {
          webpack: require('webpack')
        });
      }
    }
  });

  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: (0, _getConfig.default)(webpackOpts)
  });
}