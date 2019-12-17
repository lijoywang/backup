"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _getUserConfig2 = _interopRequireDefault(require("./getUserConfig"));

var _getUserPlugins = _interopRequireDefault(require("./getUserConfig/getUserPlugins"));

var _getWebpackConfig = _interopRequireDefault(require("./getWebpackConfig"));

var _getPaths = _interopRequireDefault(require("./getPaths"));

var _signale = _interopRequireDefault(require("signale"));

var _lodash = require("lodash");

var _PluginApi = _interopRequireDefault(require("./PluginApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require('./getUserConfig/options'),
      defaults = _require.defaults,
      validate = _require.validate;

const _require2 = require('./utils'),
      warn = _require2.warn,
      error = _require2.error;

const debug = require('debug');

const readPkg = require('read-pkg');

class Service {
  constructor(cwd, opts) {
    this.cwd = cwd || process.cwd(); // resolve pkg

    this.pkg = readPkg.sync({
      cwd
    });
    this.commands = {};
    this.pluginHooks = {};
    this.pluginMethods = {};
    this.generators = {}; // resolve user config

    const _getUserConfig = (0, _getUserConfig2.default)({
      cwd: this.cwd
    }),
          userConfig = _getUserConfig.config;

    this.config = userConfig;
    this.projectConfig = (0, _lodash.defaultsDeep)(userConfig, defaults());
    debug('service:')('projectOptions: ', this.projectConfig); // resolve plugins

    this.plugins = this.resolvePlugins();
    this.extraPlugins = [];
    debug('plugins:')(this.plugins); // resolve paths

    this.paths = (0, _getPaths.default)(this);
  }

  init(mode) {
    this.mode = mode; // load mode .env

    this.loadEnv(mode); // init plugins

    this.initPlugins();
  }

  resolvePlugins() {
    const idToPlugin = id => {
      const apply = require(id);

      return {
        id: id.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts: {}
      };
    }; // 内置插件


    const builtInPlugins = ['./commands/dev', './commands/build', './commands/help.js'].map(idToPlugin);
    const userPlugins = (0, _getUserPlugins.default)({
      cwd: this.cwd,
      plugins: this.projectConfig.plugins || []
    });
    return [...builtInPlugins, ...userPlugins];
  }

  initPlugin(plugin) {
    const id = plugin.id,
          apply = plugin.apply,
          opts = plugin.opts;
    let handlers = {
      get: (target, prop) => {
        if (this.pluginMethods[prop]) {
          return this.pluginMethods[prop];
        }

        if ([// methods
        'changePluginOption', 'applyPlugins', '_applyPluginsAsync', // properties
        'cwd', 'config', 'webpackConfig', 'pkg', 'paths', // dev methods
        'restart', 'printError', 'printWarn', 'refreshBrowser', 'rebuildHTML'].includes(prop)) {
          if (typeof this[prop] === 'function') {
            return this[prop].bind(this);
          }

          return this[prop];
        }

        return target[prop];
      }
    }; // instantiation PluginApi

    const api = new Proxy(new _PluginApi.default(id, this), handlers);
    debug('plugins:')(`initPlugin${id}`);

    api.onOptionChange = fn => {
      plugin.onOptionChange = fn;
    }; // apply plugins.


    apply(api, opts);
    plugin._api = api;
  }

  initPlugins() {
    this.plugins.forEach(plugin => {
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
    } // Throw error for methods that can't be called after plugins is initialized


    this.plugins.forEach(plugin => {
      ['onOptionChange', 'register', 'registerMethod', 'registerPlugin'].forEach(method => {
        plugin._api[method] = () => {
          throw new Error(`api.${method}() should not be called after plugin is initialized.`);
        };
      });
    });
  }

  run(name, args = {}, rawArgv = []) {
    var _this = this;

    return _asyncToGenerator(function* () {
      debug('service:')(name);
      const mode = args.mode || name === 'build' ? 'production' : 'development'; // load env variables, load user config, apply plugins

      _this.init(mode);

      debug('plugins:')(`run ${name} with args ${JSON.stringify(args)}`);
      args._ = args._ || [];
      let command = _this.commands[name];

      if (!command) {
        _signale.default.error(`Command ${chalk.underline.cyan(name)} does not exists`);

        process.exit(1);
      }

      const fn = command.fn,
            opts = command.opts;

      if (opts.webpack) {
        // webpack config
        _this.webpackConfig = (0, _getWebpackConfig.default)(_this);
      }

      return fn(args, rawArgv);
    })();
  }

  changePluginOption(id, newOpts) {
    const plugin = this.plugins.filter(p => p.id === id)[0];
    plugin.opts = newOpts;

    if (plugin.onOptionChange) {
      plugin.onOptionChange(newOpts);
    } else {
      this.restart(`plugin ${id}'s option changed`);
    }
  }

  applyPlugins(key, opts = {}) {
    debug('plugins:')(`apply plugins ${key}`); // debug('plugins:')(`apply plugins opts${JSON.stringify(opts)}`)

    return (this.pluginHooks[key] || []).reduce((memo, {
      fn
    }) => {
      return fn({
        memo,
        args: opts.args
      });
    }, opts.initialValue);
  }

  _applyPluginsAsync(key, opts = {}) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      debug('plugins:')(`apply plugins async ${key}`);
      const hooks = _this2.pluginHooks[key] || [];
      let memo = opts.initialValue;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = hooks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          const hook = _step.value;
          const fn = hook.fn;
          memo = yield fn({
            memo,
            args: opts.args
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return memo;
    })();
  }

  loadEnv(mode) {
    if (mode) {
      const defaultNodeEnv = mode === 'production' || mode === 'test' ? mode : 'development';
      process.env.NODE_ENV = defaultNodeEnv;
      process.env.BASE_URL = this.config.baseUrl;
    }
  }

}

exports.default = Service;