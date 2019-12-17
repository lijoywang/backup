import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { isPlainObject } from 'lodash';
import stripJsonComments from 'strip-json-comments';
// import { CONFIG_FILES } from '../constants';

const chalk = require('chalk');
const { error } = require('../utils');
const { validate } = require('./options');

function merge(oldObj, newObj) {
  for (const key in newObj) {
    if (Array.isArray(newObj[key]) && Array.isArray(oldObj[key])) {
      oldObj[key] = oldObj[key].concat(newObj[key]);
    } else if (isPlainObject(newObj[key]) && isPlainObject(oldObj[key])) {
      oldObj[key] = Object.assign(oldObj[key], newObj[key]);
    } else {
      oldObj[key] = newObj[key];
    }
  }
}

// function getConfigFile(cwd, service) {
//   const files = CONFIG_FILES.map((file) => join(cwd, file)).filter((file) =>
//     existsSync(file)
//   );

//   if (files.length > 1 && service.printWarn) {
//     service.printWarn([
//       `Muitiple config files ${files.join(', ')} detected, cli will use ${
//         files[0]
//       }.`,
//     ]);
//   }
//   return files[0];
// }

export default function getUserConfig(opts = {}) {
  const { cwd = process.cwd(), configFile = '.webpackrc' } = opts;

  // Read config from configFile and `${configFile}.js`
  const rcConfig = resolve(cwd, configFile);
  const jsConfig = resolve(cwd, `${configFile}.js`);

  let config = {};
  if (existsSync(rcConfig)) {
    config = JSON.parse(stripJsonComments(readFileSync(rcConfig, 'utf-8')));
  }

  if (existsSync(jsConfig)) {
    // eslint-disable-next-line import/no-dynamic-require
    config = require(jsConfig);
    if (config.default) {
      config = config.default;
    }
  }

  // Validate配置文件参数
  validate(config, (msg) => {
    error(`Invalid options in ${chalk.bold('.webpackrc')}: ${msg}`);
  });

  // Merge config with current env
  if (config.env) {
    if (config.env[process.env.NODE_ENV]) {
      merge(config, config.env[process.env.NODE_ENV]);
    }
    delete config.env;
  }

  return { config };
}
