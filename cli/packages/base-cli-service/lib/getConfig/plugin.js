"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

const fs = require('fs');

const path = require('path');

function makeArray(item) {
  if (Array.isArray(item)) return item;
  return [item];
}

function _default(webpackConfig, opts) {
  const isProd = process.env.NODE_ENV === 'production';
  const cwd = opts.cwd;
  const htmlOptions = {};

  if (isProd) {
    // code splitting
    webpackConfig.optimization.splitChunks({
      cacheGroups: {
        // vendors: {
        //   name: `chunk-vendors`,
        //   test: /[\\/]node_modules[\\/]/,
        //   priority: -10,
        //   chunks: 'initial',
        // },
        common: {
          name: `chunk-common`,
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    });
    Object.assign(htmlOptions, {
      filename: 'html/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference

      }
    });
  }

  const _require = require('../utils'),
        resolveDefine = _require.resolveDefine; // plugins -> define


  webpackConfig.plugin('define').use(require('webpack/lib/DefinePlugin'), [resolveDefine(opts)]); // plugins -> progress bar

  webpackConfig.plugin('progress').use(require('webpackbar'), [{
    color: 'green',
    reporters: ['fancy']
  }]);

  if (process.env.HTML !== 'none') {
    const HTMLPlugin = require('html-webpack-plugin');

    const htmlPath = path.resolve(cwd, 'src/index.html');
    const defaultHtmlPath = path.resolve(__dirname, '../../index-default.html'); // resolve page index template

    htmlOptions.template = fs.existsSync(htmlPath) ? htmlPath : defaultHtmlPath;
    htmlOptions.templateParameters = {
      BASE_URL: opts.publicPath
    };
    webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
  } // copy static assets in public/


  const publicDir = path.resolve(cwd, 'static');
  const outputDir = path.resolve(cwd, opts.outputPath);
  const publicCopyIgnore = ['index.html', '.DS_Store'];

  if (fs.existsSync(publicDir)) {
    webpackConfig.plugin('copy').use(require('copy-webpack-plugin'), [[{
      from: publicDir,
      to: outputDir,
      toType: 'dir',
      ignore: publicCopyIgnore
    }]]);
  } // plugins -> analyze


  if (process.env.ANALYZE) {
    webpackConfig.plugin('bundle-analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [{
      analyzerMode: 'server',
      analyzerPort: process.env.ANALYZE_PORT || 8888,
      openAnalyzer: true,
      // generate stats file while ANALYZE_DUMP exist
      generateStatsFile: !!process.env.ANALYZE_DUMP,
      statsFilename: process.env.ANALYZE_DUMP || 'stats.json'
    }]);
  } // plugins -> friendly-errors


  const _process$env$CLEAR_CO = process.env.CLEAR_CONSOLE,
        CLEAR_CONSOLE = _process$env$CLEAR_CO === void 0 ? 'none' : _process$env$CLEAR_CO;

  const _require2 = require('../utils'),
        transformer = _require2.transformer,
        formatter = _require2.formatter;

  webpackConfig.plugin('friendly-errors').use(require('friendly-errors-webpack-plugin'), [{
    clearConsole: CLEAR_CONSOLE !== 'none',
    additionalTransformers: [transformer],
    additionalFormatters: [formatter]
  }]);
}