#!/usr/bin/env node

const semver = require('semver');
const chalk = require('chalk');
const packageJson = require('../package.json');

// 验证node版本
const nodeVersion = packageJson.engines.node;
if (!semver.satisfies(process.version, nodeVersion)) {
  console.log(chalk.red(`当前node版本${process.version}，fepro依赖的node version${nodeVersion}，请升级你的node版本。`));
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

const program = require('commander');

program
  .version(packageJson.version)
  .usage('<commonad> [options]');

program
  .command('create <project-name>')
  .description('初使化一个新的前端项目')
  .option('-f, --force', '如果当前项目存在，则强制覆盖')
  .action((name, options) => {
    require('../libs/create')(name, options);
  });

program
  .command('add <template-name>')
  .description('添加新的模板页')
  .action((name, options) => {
    require('../libs/add')(name, options);
  });

program
  .command('install [plugin-name]')
  .description('添加插件')
  .option('-D', '安装开发环境')
  .option('-S', '安装生产环境')
  .action(async (name, options) => {
    const { install } = await require('../libs/plugin')(name, options);
    if (install) {
      install();
    }
  });

program
  .command('uninstall [plugin-name]')
  .description('移除插件')
  .action(async (name, options) => {
    const { uninstall } = await require('../libs/plugin')(name, options);
    if (uninstall) {
      uninstall();
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
