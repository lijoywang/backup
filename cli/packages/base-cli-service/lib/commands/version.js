"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fs = require("fs");

var _default = api => {
  api.registerCommand('version', {
    description: 'show related versions'
  }, args => {
    const pkg = require('../../package.json');

    if (args.verbose) {
      const versions = api.applyPlugins('addVersionInfo', {
        initialValue: [`${process.platform} ${process.arch}`, `node@${process.version}`, `base-cli-service@${pkg.version}`]
      });
      versions.forEach(version => {
        console.log(version);
      });
    } else {
      console.log(pkg.version);
    }
  });
};

exports.default = _default;