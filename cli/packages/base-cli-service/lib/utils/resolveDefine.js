"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const prefixRE = /^MFW_APP_/;

exports.resolveDefine = function (opts) {
  const env = {};
  Object.keys(process.env).forEach(key => {
    if (prefixRE.test(key) || key === 'NODE_ENV' || key === 'HMR' || key === 'SOCKET_SERVER') {
      env[key] = process.env[key];
    }
  });

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }

  const define = {};

  if (opts.define) {
    for (const key in opts.define) {
      define[key] = JSON.stringify(opts.define[key]);
    }
  }

  env.BASE_URL = JSON.stringify(opts.baseUrl);
  return _objectSpread({
    'process.env': env
  }, define);
};