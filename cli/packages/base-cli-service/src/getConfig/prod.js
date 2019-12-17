import UglifyPlugin from 'uglifyjs-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { isPlainObject } from 'lodash';
import uglifyOptions from './uglifyOptions';
import terserOptions from './terserOptions';

function mergeConfig(config, userConfig) {
  if (typeof userConfig === 'function') {
    return userConfig(config);
  } else if (isPlainObject(userConfig)) {
    return {
      ...config,
      ...userConfig,
    };
  } else {
    return config;
  }
}

export default function(webpackConfig, opts) {
  webpackConfig.mode('production').devtool(opts.devtool);

  webpackConfig.performance.hints(false);

  webpackConfig.optimization
    // don't emit files if have error
    .noEmitOnErrors(true);

  webpackConfig.output
    .filename(`js/[name].[chunkhash:8].js`)
    .chunkFilename(`js/[name].[chunkhash:8].async.js`);

  webpackConfig
    .plugin('hash-module-ids')
    .use(require('webpack/lib/HashedModuleIdsPlugin'));

  if (opts.manifest) {
    webpackConfig.plugin('manifest').use(require('webpack-manifest-plugin'), [
      {
        fileName: 'asset-manifest.json',
        ...opts.manifest,
      },
    ]);
  }

  let minimizerName = 'uglifyjs';
  let minimizerPlugin = UglifyPlugin;
  let minimizerOptions = [
    mergeConfig(
      {
        ...uglifyOptions,
        sourceMap: !!opts.devtool,
      },
      opts.uglifyJSOptions
    ),
  ];

  if (opts.minimizer === 'terserjs') {
    minimizerName = 'terserjs';
    minimizerPlugin = TerserPlugin;
    minimizerOptions = [
      mergeConfig(
        {
          ...terserOptions,
          sourceMap: !!opts.devtool,
        },
        opts.terserJSOptions
      ),
    ];
  }

  webpackConfig.optimization
    .minimizer(minimizerName)
    .use(minimizerPlugin, minimizerOptions);
}
