import chalk from 'chalk';
import { padEnd } from 'lodash';

export default (api) => {
  const { service, log, debug } = api;
  const { cwd } = service;

  api.registerCommand('help', {}, (args) => {
    const helpInfo = api.applyPlugins('_modifyHelpInfo', {
      initialValue: {
        scriptName: 'mfw-cli-service',
        commands: api.service.commands,
      },
    });
    const command = args._[0];
    if (!command) {
      logMainHelp(helpInfo);
    } else {
      logHelpForCommand(command, helpInfo.commands[command]);
    }
  });
};

function logMainHelp(helpInfo) {
  console.log(
    `\n  Usage: ${helpInfo.scriptName} <command> [options]\n` +
      `\n  Commands:\n`
  );
  const commands = helpInfo.commands;
  const padLength = getPadLength(commands);

  for (const name in commands) {
    const opts = commands[name].opts || {};
    if (opts.hide !== true) {
      console.log(
        `    ${chalk.green(padEnd(name, padLength))}${opts.description || ''}`
      );
    }
  }
  console.log(
    `\n  run ${chalk.blue(
      `${helpInfo.scriptName} help [command]`
    )} for usage of a specific command.\n`
  );
}

function logHelpForCommand(name, command) {
  if (!command) {
    console.log(chalk.red(`\n  command "${name}" does not exist.`));
  } else {
    const opts = command.opts || {};
    if (opts.usage) {
      console.log(`\n  Usage: ${opts.usage}`);
    }
    if (opts.options) {
      console.log(`\n  Options:\n`);
      const padLength = getPadLength(opts.options);
      for (const name in opts.options) {
        console.log(
          `    ${chalk.green(padEnd(name, padLength))}${opts.options[name]}`
        );
      }
    }
    if (opts.details) {
      console.log();
      console.log(
        opts.details
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n')
      );
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
