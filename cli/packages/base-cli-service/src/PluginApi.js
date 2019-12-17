import debug from 'debug';
import assert from 'assert';
import signale from 'signale';
import lodash from 'lodash';
import Generator from 'yeoman-generator';

export default class PluginApi {
  /**
   * @param {string} id - Id of the plugin.
   * @param {Service} service - A cli-service instance.
   */
  constructor(id, service) {
    this.id = id;
    this.service = service;

    // utils
    this.debug = debug(`cli-plugin: ${id}`);
    this.log = signale;
    this._ = lodash;
    this.Generator = Generator;

    this.API_TYPE = {
      ADD: Symbol('add'),
      MODIFY: Symbol('modify'),
      EVENT: Symbol('event'),
    };
    this._addMethods();
  }

  // 方法分类注册
  _addMethods() {
    [
      ['chainWebpackConfig', { type: this.API_TYPE.EVENT }],
      'onStart',
      'beforeDevServer',
      '_beforeDevServerAsync',
      'afterDevServer',
      'onHTMLRebuild',
      'modifyWebpackConfig',
    ].forEach((method) => {
      if (Array.isArray(method)) {
        this.registerMethod(...method);
      } else {
        let type;
        const isPrivate = method.charAt(0) === '_';
        const slicedMethod = isPrivate ? method.slice(1) : method;
        if (slicedMethod.indexOf('add') === 0) {
          type = this.API_TYPE.ADD;
        } else if (slicedMethod.indexOf('modify') === 0) {
          type = this.API_TYPE.MODIFY;
        } else if (
          slicedMethod.indexOf('on') === 0 ||
          slicedMethod.indexOf('before') === 0 ||
          slicedMethod.indexOf('after') === 0
        ) {
          type = this.API_TYPE.EVENT;
        }
        this.registerMethod(method, { type });
      }
    });
  }

  /**
   * @param {string} hook - .
   * @param {Service} fn - .
   */
  register(hook, fn) {
    assert(
      typeof hook === 'string',
      `The first argument of api.register() must be string, but got ${hook}`
    );
    assert(
      typeof fn === 'function',
      `The second argument of api.register() must be function, but got ${fn}`
    );
    const { pluginHooks } = this.service;
    pluginHooks[hook] = pluginHooks[hook] || [];
    pluginHooks[hook].push({
      fn,
    });
  }

  /**
   * Register a command that will become available as `service [name]`.
   *
   * @param {string} name
   * @param {object} [opts]
   *   {
   *     description: string,
   *     usage: string,
   *     options: { [string]: string }
   *   }
   * @param {function} fn
   *   (args: { [string]: string }, rawArgs: string[]) => ?Promise
   */
  registerCommand(name, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts;
      opts = null;
    }
    this.service.commands[name] = { fn, opts: opts || {} };
    debug(`plugin:`)(this.service.commands);
  }

  /**
   * Register a Generator .
   *
   * @param {string} name
   * @param {object} [opts]
   *   {
   *     Generator: [Generator] A Generator instance.
   *   }
   */
  registerGenerator(name, opts) {
    const { generators } = this.service;
    assert(
      typeof name === 'string',
      `name should be supplied with a string, but got ${name}`
    );
    assert(opts && opts.Generator, `opts.Generator should be supplied`);
    assert(
      !(name in generators),
      `Generator ${name} exists, please select another one.`
    );
    generators[name] = opts;
  }


  /**
   * Register a Plugin .
   *
   * @param {object} [opts]
   *   {
   *      id: [string],
   *      apply: [function]
   *    }
   */
  registerPlugin(opts) {
    const { id, apply } = opts;
    assert(id && apply, `id and apply must supplied`);
    assert(typeof id === 'string', `id must be string`);
    assert(typeof apply === 'function', `apply must be function`);
    assert(
      id.indexOf('user:') !== 0 && id.indexOf('built-in:') !== 0,
      `api.registerPlugin() should not register plugin prefixed with user: and built-in:`,
    );
    assert(
      Object.keys(opts).every(key => ['id', 'apply', 'opts'].includes(key)),
      `Only id, apply and opts is valid plugin properties`,
    );
    this.service.extraPlugins.push(opts);
  }
  

  /**
   * @param {string} methodName - .
   * @param {API_TYPE} type - .
   */
  registerMethod(name, opts) {
    const { type } = opts;
    this.service.pluginMethods[name] = (...args) => {
      if (type === this.API_TYPE.ADD) {
        this.register(name, (opts) => {
          return (opts.memo || []).concat(
            typeof args[0] === 'function'
              ? args[0](opts.memo, opts.args)
              : args[0]
          );
        });
      } else if (type === this.API_TYPE.MODIFY) {
        this.register(name, (opts) => {
          return typeof args[0] === 'function'
            ? args[0](opts.memo, opts.args)
            : args[0];
        });
      } else if (type === this.API_TYPE.EVENT) {
        this.register(name, (opts) => {
          args[0](opts.args);
        });
      }
    };
  }
}
