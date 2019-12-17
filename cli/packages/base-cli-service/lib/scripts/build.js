"use strict";

var _yargsParser = _interopRequireDefault(require("yargs-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.NODE_ENV = 'production';
const args = (0, _yargsParser.default)(process.argv.slice(2));

const Service = require('../Service').default;

new Service(process.env.CLI_CONTEXT || process.cwd()).run('build', args);