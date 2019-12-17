#!/usr/bin/env node
const yParser = require('yargs-parser');
const semver = require('semver');
const requiredVersion = require('../package.json').engines.node;
const { error } = require('../lib/utils');

let script = process.argv[2];
const args = yParser(process.argv.slice(3));

if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but vue-cli-service ` +
      `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  );
  process.exit(1);
}

const aliasMap = {
  '-v': 'version',
  '--version': 'version',
  '-h': 'help',
  '--help': 'help',
};

switch (script) {
  case 'build':
  case 'dev':
    require(`../lib/scripts/${script}`);
    break;
  default: {
    const Service = require('../lib/Service').default;
    new Service(process.env.CLI_CONTEXT || process.cwd())
      .run(aliasMap[script] || script, args)
      .catch((err) => {
        error(err);
        process.exit(1);
      });
    break;
  }
}
