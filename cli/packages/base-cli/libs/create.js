/**
 * @file 初始化项目
 */
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const execa = require('execa');
const questions = require('./utils/questions');
const { version } = require('../package.json');
const cloneTempalte = require('./utils/cloneTemplate');
const generator = require('./utils/generator');

class Create {
  constructor(name, context, options) {
    this.name = name;
    this.context = context;
    this.options = options;

    this.apply();
  }

  async apply() {
    const preset = await questions({
      projectName: this.name,
      package: {
        plugins: [ ]
      }
    });

    const create = generator(this.context, preset);
    // 默认输出package.json
    create.writePackage();
    // git init
    await this.run('git init');
    // 克隆模板
    await cloneTempalte.init(this.context, preset);
    // 初始化项目依赖
    await create.install();
    // 输出配置文件
    create.writeConfigFiles();
    // console info
    console.log(chalk.cyan(`\ncd ${this.name}`));
    console.log(chalk.cyan('npm run dev'));
  }

  async run (command, args) {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    return execa(command, args, { cwd: this.context })
  }
}

module.exports = async (name, options) => {
  const context = path.resolve(process.cwd(), name || '.');

  if (fs.existsSync(context)) {
    if (options.force) {
      fs.remove(this.context);
    } else {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `这个目录 ${chalk.cyan(context)} 已经存在. 请选择：`,
          choices: [
            { name: '覆盖', value: 'overwrite' },
            { name: '合并', value: 'merge' },
            { name: '取消', value: 'cancel' }
          ]
        }
      ]);

      if (action === 'overwrite') {
        console.log(`\n移除 ${chalk.cyan(context)}...`);
        fs.remove(context);
      } else if (action === 'cancel') {
        return;
      }
    }
  }

  return new Create(name, context, options);
};
