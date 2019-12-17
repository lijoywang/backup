'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ApiProxyPlugin = require('@mfw/api-proxy-webpack-plugin');
const minimatch = require('minimatch');
const Handlebars = require('handlebars');
const _assign = require('lodash.assign');
const _clonedeep = require('lodash.clonedeep');
const path = require('path');
const { existsSync } = require('fs');

function getEntryValue(values) {
  if (typeof values === 'string') {
    return values;
  }

  const cwd = process.cwd();
  let result;

  values.forEach((value) => {
    if (value.match(cwd)) {
      result = value;
      return;
    }
  });

  return result;
}

class MultiHtmlWebpackPlugin {
  constructor(options) {
    this.options = _assign(
      {
        rule: '**/main.*s',
        context: 'src/pages',
        filename: '{{foldername}}/index.html',

        // 根据入口返回不同的chunks
        // activeChunks(entry) {
        //   return [];
        // },
        activeOptions(etnry, htmlPluginOptions) {
          return htmlPluginOptions;
        },
        chunks: [],
      },
      options
    );
  }

  apply(compiler) {
    const entries = compiler.options.entry;
    const template = Handlebars.compile(this.options.filename);
    const context = path.resolve(this.options.context || compiler.context);

    let htmlWebpackPluginArrays = [];

    Object.keys(entries).forEach((name) => {
      const entryValue = entries[name];
      const entry = path.resolve(context, getEntryValue(entryValue));
      const dirname = path.dirname(entry);
      const foldername = dirname.replace(context, '');

      let htmlWebpackPluginOptions = _clonedeep(this.options);
      if (minimatch(entry, this.options.rule)) {
        htmlWebpackPluginOptions.filename = path
          .normalize(template({ foldername }))
          .replace(/^\//, '');
        // 设置默认template
        let templatePath = path.resolve(dirname, 'index.ejs');
        if (!existsSync(templatePath)) {
          templatePath = path.join(__dirname, '../template/index.ejs');
        }

        htmlWebpackPluginOptions.template =
          this.options.template || templatePath;

        htmlWebpackPluginOptions.chunks.push(name);

        this.options.activeOptions(entry, htmlWebpackPluginOptions, (paths) =>
          path.join(context, '../', paths)
        );

        htmlWebpackPluginArrays.push(
          new HtmlWebpackPlugin(htmlWebpackPluginOptions)
        );
        if (this.options.proxy) {
          htmlWebpackPluginArrays.push(
            new ApiProxyPlugin({ url: this.options.proxy })
          );
        }
      }
    });

    if (htmlWebpackPluginArrays.length) {
      compiler.apply(...htmlWebpackPluginArrays);
    }
  }
}
module.exports = MultiHtmlWebpackPlugin;
