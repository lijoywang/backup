"use strict";

const chalk = require('chalk');

const rules = [{
  type: 'cant-resolve-loader',
  re: /Can't resolve '(.*loader)'/,
  msg: (e, match) => `Failed to resolve loader: ${chalk.yellow(match[1])}\n` + `You may need to install it.`
}];

exports.transformer = error => {
  if (error.webpackError) {
    const message = typeof error.webpackError === 'string' ? error.webpackError : error.webpackError.message || '';

    for (var _i = 0; _i < rules.length; _i++) {
      const _rules$_i = rules[_i],
            re = _rules$_i.re,
            msg = _rules$_i.msg,
            type = _rules$_i.type;
      const match = message.match(re);

      if (match) {
        return Object.assign({}, error, {
          // type is necessary to avoid being printed as defualt error
          // by friendly-error-webpack-plugin
          type,
          shortMessage: msg(error, match)
        });
      }
    } // no match, unknown webpack error without a message.
    // friendly-error-webpack-plugin fails to handle this.


    if (!error.message) {
      return Object.assign({}, error, {
        type: 'unknown-webpack-error',
        shortMessage: message
      });
    }
  }

  return error;
};

exports.formatter = errors => {
  errors = errors.filter(e => e.shortMessage);

  if (errors.length) {
    return errors.map(e => e.shortMessage);
  }
};