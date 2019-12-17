import getUserConfig from './getUserConfig';
import getUserPlugins from './getUserConfig/getUserPlugins';
import getWebpackConfig from './getWebpackConfig';
import getPaths from './getPaths';
import signale from 'signale';

import { defaultsDeep } from 'lodash';
import PluginApi from './PluginApi';
const { defaults, validate } = require('./getUserConfig/options');

const { warn, error } = require('./utils');
const debug = require('debug');
const readPkg = require('read-pkg');

export default class Service {
  constructor(cwd, opts) {
    this.cwd = cwd || process.cwd();
    // resolve pkg
    this.pkg = readPkg.sync({ cwd });
    this.commands = {};

    this.pluginHooks = {};
    this.pluginMethods = {};
    this.generators = {};

    // resolve user config
    const { config: userConfig } = getUserConfig({
      cwd: this.cwd,
    });
    this.config = userConfig;
    this.projectConfig = defaultsDeep(userConfig, defaults());
    debug('service:')('projectOptions: ', this.projectConfig);
    // resolve plugins
    this.plugins = this.resolvePlugins();
    this.extraPlugins = [];
    debug('plugins:')(this.plugins);

    // resolve paths
    this.paths = getPaths(this);
  }

  init(mode) {
    this.mode = mode;
    // load mode .env
    this.loadEnv(mode);
    // init plugins
    this.initPlugins();
  }

  resolvePlugins() {
    const idToPlugin = (id) => {
      const apply = require(id);
      return {
        id: id.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts: {},
      };
    };
    // 内置插件
    const builtInPlugins = [
      './commands/dev',
      './commands/build',
      './commands/help.js',
    ].map(idToPlugin);

    const userPlugins = getUserPlugins({
      cwd: this.cwd,
      plugins: this.projectConfig.plugins || [],
    });

    return [...builtInPlugins, ...userPlugins];
  }

  initPlugin(plugin) {
    const { id, apply, opts } = plugin;
    let handlers = {
      get: (target, prop) => {
        if (this.pluginMethods[prop]) {
          return this.pluginMethods[prop];
        }
        if (
          [
            // methods
            'changePluginOption',
            'applyPlugins',
            '_applyPluginsAsync',
            // properties
            'cwd',
            'config',
            'webpackConfig',
            'pkg',
            'paths',
            // dev methods
            'restart',
            'printError',
            'printWarn',
            'refreshBrowser',
            'rebuildHTML',
          ].includes(prop)
        ) {
          if (typeof this[prop] === 'function') {
            return this[prop].bind(this);
          }
          return this[prop];
        }
        return target[prop];
      },
    };
    // instantiation PluginApi
    const api = new Proxy(new PluginApi(id, this), handlers);
    debug('plugins:')(`initPlugin${id}`);
    api.onOptionChange = (fn) => {
      plugin.onOptionChange = fn;
    };
    // apply plugins.
    apply(api, opts);
    plugin._api = api;
  }

  initPlugins() {
    this.plugins.forEach((plugin) => {
      this.initPlugin(plugin);
    });

    while (this.extraPlugins.length) {
      const extraPlugins = cloneDeep(this.extraPlugins);
      this.extraPlugins = [];
      extraPlugins.forEach(plugin => {
        this.initPlugin(plugin);
        this.plugins.push(plugin);
      });
      count += 1;
      assert(count <= 10, `插件注册死循环...`);
    }

    // Throw error for methods that can't be called after plugins is initialized
    this.plugins.forEach(plugin => {
      [
        'onOptionChange',
        'register',
        'registerMethod',
        'registerPlugin',
      ].forEach(method => {
        plugin._api[method] = () => {
          throw new Error(
            `api.${method}() should not be called after plugin is initialized.`,
          );
        };
      });
    });
  }

  async run(name, args = {}, rawArgv = []) {
    debug('service:')(name);
    const mode = args.mode || name === 'build' ? 'production' : 'development';
    // load env variables, load user config, apply plugins
    this.init(mode);
    debug('plugins:')(`run ${name} with args ${JSON.stringify(args)}`);

    args._ = args._ || [];
    let command = this.commands[name];

    if (!command) {
      signale.error(`Command ${chalk.underline.cyan(name)} does not exists`);
      process.exit(1);
    }

    const { fn, opts } = command;
    if (opts.webpack) {
      // webpack config
      this.webpackConfig = getWebpackConfig(this);
    }
    return fn(args, rawArgv);
  }

  changePluginOption(id, newOpts) {
    const plugin = this.plugins.filter((p) => p.id === id)[0];
    plugin.opts = newOpts;
    if (plugin.onOptionChange) {
      plugin.onOptionChange(newOpts);
    } else {
      this.restart(`plugin ${id}'s option changed`);
    }
  }

  applyPlugins(key, opts = {}) {
    debug('plugins:')(`apply plugins ${key}`);
    // debug('plugins:')(`apply plugins opts${JSON.stringify(opts)}`)
    return (this.pluginHooks[key] || []).reduce((memo, { fn }) => {
      return fn({
        memo,
        args: opts.args,
      });
    }, opts.initialValue);
  }

  async _applyPluginsAsync(key, opts = {}) {
    debug('plugins:')(`apply plugins async ${key}`);
    const hooks = this.pluginHooks[key] || [];
    let memo = opts.initialValue;
    for (const hook of hooks) {
      const { fn } = hook;
      memo = await fn({
        memo,
        args: opts.args,
      });
    }
    return memo;
  }

  loadEnv(mode) {
    if (mode) {
      const defaultNodeEnv =
        mode === 'production' || mode === 'test' ? mode : 'development';
      process.env.NODE_ENV = defaultNodeEnv;
      process.env.BASE_URL = this.config.baseUrl;
    }
  }
}
