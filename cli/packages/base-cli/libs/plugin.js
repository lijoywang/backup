/**
 * @file 添加卸载插件
 */
const path = require('path');
const questions = require('./utils/questions.js');
const { customPlugins } = require('./config');
const stateExeca = require('./utils/stateExeca');
const Service = require('./utils/Service');
const chalk = require('chalk');

module.exports = async (pluginName, options = { }) => {
  const context = process.cwd();

  if (!pluginName) {
    let { plugins } = await questions(
      { },
      [ path.join(__dirname, './questions/install') ]
    );

    if (plugins) {
      pluginName = plugins;
    }
  }

  let webpackrc = require(`${context}/.webpackrc.js`);

  const service =  new Service(
    webpackrc,
    require(`${context}/package.json`),
    context
  );

  return {
    async install() {
      if (pluginName) {
        if (Object.keys(customPlugins).includes(pluginName)) {
          service.addPlugin(customPlugins[pluginName], webpackrc);
          await service.apply();
        } else {
          await stateExeca(context, [
            'install',
            pluginName,
            options.D ? '-D' : '-S'
          ]);
        }

        // console info
        console.log(chalk.cyan(`install ${pluginName} finished.`));
      }
    },

    async uninstall() {
      if (pluginName) {
        if (Object.keys(customPlugins).includes(pluginName)) {
          await service.removePlugin(customPlugins[pluginName]);
        } else {
          await service.uninstall(pluginName);
        }

        // console info
        console.log(chalk.cyan(`uninstall ${pluginName} finished.`));
      }
    }
  }
};
