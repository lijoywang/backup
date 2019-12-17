"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _fs = require("fs");

function test(path) {
  return (0, _fs.existsSync)(path) && (0, _fs.statSync)(path).isDirectory();
}

function _default(service) {
  const cwd = service.cwd,
        config = service.config;
  const outputPath = config.outputPath || './public';
  let pagesPath = 'pages';

  if (test((0, _path.join)(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }

  const absPagesPath = (0, _path.join)(cwd, pagesPath);
  const absSrcPath = (0, _path.join)(absPagesPath, '../');
  return {
    cwd,
    outputPath,
    absOutputPath: (0, _path.join)(cwd, outputPath),
    absPagesPath,
    absSrcPath
  };
}