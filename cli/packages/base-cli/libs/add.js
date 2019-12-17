/**
 * @file 添加新模板
 */
const path = require('path');
const questions = require('./utils/questions.js');
const cloneTempalte = require('./utils/cloneTemplate');
const chalk = require('chalk');

module.exports = (name, options) => {
  let webpackrc = {
    projectName: name,
    plugins: [ ]
  };
  const context = process.cwd();

  const run = async () => {
    const framework = webpackrc.framework;
    if (framework) {
      const answers = {
        vue: [
          {
            name: 'isRouter',
            message: '是否选择vue-router?',
            type: 'confirm'
          },
          {
            name: 'isHistory',
            message: 'mode history?',
            type: 'confirm',
            when: anwser => anwser.isRouter
          }
        ]
      }[framework];

      if (answers) {
        let preset = await questions(webpackrc, answers);
        // preset filter
        if (preset.isRouter) {
          preset.plugins.push('vueRouter');
        }

        await cloneTempalte.add(context, preset, name);
        // console info
        console.log(chalk.cyan(`src/pages/${name} finished.`));
      } else {
        console.log(chalk.red(`当前framework ${framework} 出现异常`));
      }

    }
  };
  
  try {
    webpackrc = {
      ...webpackrc,
      ...require(`${context}/.webpackrc.js`)
    };

    run();
  } catch (err) {
    console.log('当前无配置文件');
  }
};
