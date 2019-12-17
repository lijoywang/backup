const inquirer = require('inquirer');
const { join, extname, basename, dirname } = require('path');
const resolve = require('resolve');
const MfwMultiHtmlWebpackPlugin = require('./plugin/multiWebpackPlugin');
const deasyncPromise = require('deasync-promise');
const { getEntry } = require('./utils');

/**
 *
 *
 * @param {pluginAPI} api
 * @param {object} [options]
 * {
 *     pages: {
 *      root: [string],
 *      page: [string],
 *      file: [string],
 *      exclude:[string],
 *      template: [string]
 *     },
 *     noSelectEntry: [boolean]
 *     merge: [number]
 *     selectedKeys: [Array]
 *   }
 */
module.exports = function(api, options = {}) {
  const { log, paths, config } = api;
  const isDev = process.env.NODE_ENV === 'development';
  const entries = getEntry({
    pages: options.pages || {},
    cwd: paths.cwd,
  });

  // don't generate html files
  process.env.HTML = 'none';

  api.modifyWebpackConfig((webpackConfig) => {
    webpackConfig.entry = entries;

    if (isDev && !options.noSelectEntry) {
      let keys = Object.keys(webpackConfig.entry);
      // 文件夹聚合
      let keysFinal = [ ];
      if (keys.length > 1) {
        if (options.merge) {
          keys.forEach(value => {
            const currentValue = value
              .split('/')
              .slice(0, options.merge)
              .join('/')
            
            if (currentValue !== '.' // 根路径默认选择，去除List下.的选择
                && !keysFinal.includes(currentValue)) {
              keysFinal.push(currentValue)
            }
          })
        }

        const selectedKeys = deasyncPromise(
          inquirer.prompt([
            {
              type: 'checkbox',
              name: 'pages',
              message: '请选择启动入口',
              default: options.selectedKeys || [ ],
              choices: (options.merge ? keysFinal : keys).map((v) => ({
                name: v,
              })),
              validate: (v) => {
                return v.length >= 1 || '必须选一个入口呀！';
              },
              pageSize: 18,
            },
          ])
        );

        keys.forEach((key) => {
          const isBoolen = selectedKeys.pages.some(selectedKey => key.startsWith(selectedKey));
          if (!isBoolen
            && (key !== '.') // 根路径默认选择，.代表跟路径
          ) {
            delete webpackConfig.entry[key];
          }
        });
      }
    }

    // 定义history访问规则
    const createHistoryApiRules = (options = {}) => {
      let rules = {};
      rules.rewrites = [];
      Object.keys(entries).forEach((key) => {
        let pattern = new RegExp(`^\\/${key}\\/*`, 'g');
        rules.rewrites.push({
          from: pattern,
          to: join(config.baseUrl, `${key}/index.html`),
        });
      });
      rules.index = rules.rewrites[0].to;
      return rules;
    };

    if (isDev) {
      webpackConfig.devServer = {
        ...webpackConfig.devServer,
        historyApiFallback: createHistoryApiRules(),
      };
    }

    const htmlOption = Object.assign({
      template:
        options.pages && options.pages.template
          ? resolve.sync(options.pages.template, {
              basedir: paths.cwd,
            })
          : '',
      templateParameters: {
        BASE_URL: config.baseUrl,
      },
      proxy: options.proxy,
    }, options);

    webpackConfig.plugins.push(
      new MfwMultiHtmlWebpackPlugin(
        isDev
          ? htmlOption
          : Object.assign(
              {
                filename: 'html/{{foldername}}/index.html',
                chunks: ['chunk-common'],
                proxy: null,
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeAttributeQuotes: true,
                  collapseBooleanAttributes: true,
                  removeScriptTypeAttributes: true,
                  // more options:
                  // https://github.com/kangax/html-minifier#options-quick-reference
                },
              },
              htmlOption
            )
      )
    );
    return webpackConfig;
  });

  api.chainWebpackConfig((webpackConfig) => {
    Object.keys(entries).forEach((key) => {
      let entryDir = entries[key];
      webpackConfig.resolve.alias.set(`@${key}`, dirname(entryDir));
    });
  });
};
