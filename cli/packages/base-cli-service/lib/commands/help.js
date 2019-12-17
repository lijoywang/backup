"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = api => {
  const service = api.service,
        log = api.log,
        debug = api.debug;
  const cwd = service.cwd;
  api.registerCommand('help', {}, args => {
    const helpInfo = api.applyPlugins('_modifyHelpInfo', {
      initialValue: {
        scriptName: 'mfw-cli-service',
        commands: api.service.commands
      }
    });
    const command = args._[0];

    if (!command) {
      logMainHelp(helpInfo);
    } else {
      logHelpForCommand(command, helpInfo.commands[command]);
    }
  });
};

exports.default = _default;

function logMainHelp(helpInfo) {
  console.log(`\n  Usage: ${helpInfo.scriptName} <command> [options]\n` + `\n  Commands:\n`);
  const commands = helpInfo.commands;
  const padLength = getPadLength(commands);

  for (const name in commands) {
    const opts = commands[name].opts || {};

    if (opts.hide !== true) {
      console.log(`    ${_chalk.default.green((0, _lodash.padEnd)(name, padLength))}${opts.description || ''}`);
    }
  }

  console.log(`\n  run ${_chalk.default.blue(`${helpInfo.scriptName} help [command]`)} for usage of a specific command.\n`);
}

function logHelpForCommand(name, command) {
  if (!command) {
    console.log(_chalk.default.red(`\n  command "${name}" does not exist.`));
  } else {
    const opts = command.opts || {};

    if (opts.usage) {
      console.log(`\n  Usage: ${opts.usage}`);
    }

    if (opts.options) {
      console.log(`\n  Options:\n`);
      const padLength = getPadLength(opts.options);

      for (const name in opts.options) {
        console.log(`    ${_chalk.default.green((0, _lodash.padEnd)(name, padLength))}${opts.options[name]}`);
      }
    }

    if (opts.details) {
      console.log();
      console.log(opts.details.split('\n').map(line => `  ${line}`).join('\n'));
    }
  }
}

function getPadLength(obj) {
  let longest = 10;

  for (const name in obj) {
    if (name.length + 1 > longest) {
      longest = name.length + 1;
    }
  }

  return longest;
}