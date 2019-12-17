"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getUserConfig;

var _fs = require("fs");

var _path = require("path");

var _lodash = require("lodash");

var _stripJsonComments = _interopRequireDefault(require("strip-json-comments"));

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chalk = require('chalk');

const _require = require('../utils'),
      error = _require.error;

const _require2 = require('./options'),
      validate = _require2.validate;

function merge(oldObj, newObj) {
  for (const key in newObj) {
    if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
      oldObj[key] = oldObj[key].concat(newObj[key]);
    } else if ((0, _lodash.isPlainObject)(newObj[key]) && (0, _lodash.isPlainObject)(oldObj[key])) {
      oldObj[key] = Object.assign(oldObj[key], newObj[key]);
    } else {
      oldObj[key] = newObj[key];
    }
  }
}

function getConfigFile(cwd, service) {
  const files = _constants.CONFIG_FILES.map(file => (0, _path.join)(cwd, file)).filter(file => (0, _fs.existsSync)(file));

  if (files.length > 1 && service.printWarn) {
    service.printWarn([`Muitiple config files ${files.join(', ')} detected, cli will use ${files[0]}.`]);
  }

  return files[0];
}

function getUserConfig(opts = {}) {
  const _opts$cwd = opts.cwd,
        cwd = _opts$cwd === void 0 ? process.cwd() : _opts$cwd,
        _opts$configFile = opts.configFile,
        configFile = _opts$configFile === void 0 ? '.webpackrc' : _opts$configFile; // Read config from configFile and `${configFile}.js`

  const rcConfig = (0, _path.resolve)(cwd, configFile);
  const jsConfig = (0, _path.resolve)(cwd, `${configFile}.js`);
  let config = {};

  if ((0, _fs.existsSync)(rcConfig)) {
    config = JSON.parse((0, _stripJsonComments.default)((0, _fs.readFileSync)(rcConfig, 'utf-8')));
  }

  if ((0, _fs.existsSync)(jsConfig)) {
    config = require(jsConfig);

    if (config.default) {
      config = config.default;
    }
  } // Validate配置文件参数


  validate(config, msg => {
    error(`Invalid options in ${chalk.bold('.webpackrc')}: ${msg}`);
  }); // Merge config with current env

  if (config.env) {
    if (config.env[process.env.NODE_ENV]) {
      merge(config, config.env[process.env.NODE_ENV]);
    }

    delete config.env;
  }

  return {
    config
  };
}