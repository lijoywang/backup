
const PackageJson = require('./PackageJson');
const write = require('./write');
const stateExeca = require('./stateExeca');
const fs = require('fs-extra');
const path = require('path');
const { customPlugins } = require('../config');

class Service extends PackageJson {
  /**
   * @param webpackrc {Object} serve 配置
   * @param packageJson {Object} package json
   * @param context {String} 项目地址
   */
  constructor(webpackrc, packageJson, context) {
    super();

    this.webpackrc = {...webpackrc};
    this.packageJson = {...packageJson};
    this.context = context;

    // 添加所有插件
    this.plugins = [ ];
  }

  // 项目初始化
  async apply() {
    const me = this;

    if (!this.isExistDep('@mfw/base-cli-service')) {
      this.install('@mfw/base-cli-service');
    }
    // 重写pacakgeJson
    this.writePackage();

    // 安装所有依赖
    await stateExeca(this.context);
    // 输出所有插件依赖文件
    if (this.plugins.length) {
      this.plugins.forEach(pluginName => {
        let plugin = this.getPlugin(pluginName[0]);
        if (plugin) {
          plugin.install({
            extendPackage(packageConfig) {
              me.extendPackage(packageConfig);
            },

            render(filename, content) {
              write(me.context, { [filename]: content });
            },

            addPlugin(pluginName) {
              if (!me.webpackrc.plugins.includes(pluginName)) {
                me.webpackrc.plugins.push(pluginName);
              }
            },

            modifyPkg(fun) {
              if (fun) {
                me.packageJson = fun(me.packageJson);
              }
            }
          }, pluginName[1]);
        }
      });
    }

    // 重写pacakgeJson
    this.writePackage();
    // 重写webpackrc
    this.writeWevbpackrc();

    this.plugins = [ ];

    await stateExeca(this.context);
  }

  install(depname, type = '-D') {
    if (type === '-D') {
      this.setDevDependencies(depname);
    } else {
      this.setDependencies(depname);
    }
  }

  async uninstall(dep) {
    await stateExeca(this.context, [ 'uninstall', dep ])

    this.removeDep(dep);
    this.writePackage();
  }

  writeWevbpackrc() {
    let webpackrc = {...this.webpackrc};
    // filter plugins
    const plugins = Object.values(customPlugins);
    webpackrc.plugins = webpackrc.plugins.filter(plugin=> plugins.includes(plugin));
    write(this.context, {
      '.webpackrc.js': `module.exports = ${JSON.stringify(webpackrc, null, 2)}`,
    });
  }

  getPlugin(pluginName) {
    let plugin;
    try {
      plugin = require(path.join(
        this.context,
        'node_modules',
        pluginName,
        'generator'
      ));
    } catch (error) { };

    return plugin;
  }

  addPlugin(pluginName, type = '-D', pluginOps = { }) {
    if (type != 'string') {
      pluginOps = type;
      type = '-D';
    }

    this.install(pluginName, type);
    this.plugins.push([ pluginName, pluginOps ]);
  }

  async removePlugin(pluginName) {
    const me = this;
    const plugin = this.getPlugin(pluginName);
    if (
      plugin
      && plugin.uninstall
    ) {
      plugin.uninstall({
        remove(pluginConfig) {
          const filename = path.join(me.context, pluginConfig);
          if (fs.existsSync(filename)) {
            fs.remove(filename);
          }
        },

        delProperty(property) {
          me.delProperty(property);
        },

        modifyPkg(fun) {
          if (fun) {
            me.packageJson = fun(me.packageJson);
          }
        }
      });
    }

    await this.uninstall(pluginName);

    const pluginIndex = this.webpackrc.plugins.indexOf(pluginName);
    if (pluginIndex > -1) {
      this.webpackrc.plugins.splice(pluginIndex, 1);
      this.writeWevbpackrc();
    }
  }
};

module.exports = Service;
