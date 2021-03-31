const { hasGit } = require('./utils/env');
const chalk = require('chalk');

module.exports = [
  {
    name: 'config',
    type: 'list',
    message: `Pick an ESLint config:`,
    choices: [
      {
        name: 'Error prevention only',
        value: 'base',
        short: 'Basic',
      },
      {
        name: 'Standard',
        value: 'standard',
        short: 'Standard',
      },
      {
        name: 'Prettier',
        value: 'prettier',
        short: 'Prettier',
      },
    ],
  },
  {
    name: 'lintOn',
    type: 'checkbox',
    message: 'Pick additional lint features:',
    choices: [
      {
        name: 'Lint on save',
        value: 'save',
        checked: true,
      },
      {
        name:
          'Lint and fix on commit' +
          (hasGit() ? '' : chalk.red(' (requires Git)')),
        value: 'commit',
      },
    ],
  },
];