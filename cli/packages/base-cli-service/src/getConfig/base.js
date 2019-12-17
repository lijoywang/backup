import { join, relative, resolve } from 'path';
const { getAssetPath } = require('../utils');
export default function(webpackConfig, opts) {
  const { cwd } = opts;
  const genAssetSubPath = (dir) => {
    return getAssetPath(opts, `${dir}/[name].[hash:8].[ext]`);
  };

  function makeArray(item) {
    if (Array.isArray(item)) return item;
    return [item];
  }

  const DEFAULT_INLINE_LIMIT = 10000;
  const genUrlLoaderOptions = (dir) => {
    return {
      limit: opts.inlineLimit || DEFAULT_INLINE_LIMIT,
      fallback: {
        loader: 'file-loader',
        options: {
          name: genAssetSubPath(dir),
        },
      },
    };
  };

  // TODO: 默认入口文件
  // entry
  if (opts.entry) {
    for (const key in opts.entry) {
      const entry = webpackConfig.entry(key);
      makeArray(opts.entry[key]).forEach((file) => {
        entry.add(file);
      });
    }
  } else {
    webpackConfig
      .entry('app')
      .add(join(cwd, './src/main.js'))
      .end();
  }

  // output
  const absOutputPath = resolve(cwd, opts.outputPath || 'public');
  webpackConfig.output
    .path(absOutputPath)
    .filename(`[name].js`)
    .chunkFilename(`[name].async.js`)
    .publicPath(opts.baseUrl || undefined)
    .devtoolModuleFilenameTemplate((info) => {
      return relative(cwd, info.absoluteResourcePath).replace(/\\/g, '/');
    });

  webpackConfig.resolve.modules
    .add('node_modules')
    .add(join(cwd, 'node_modules'))
    .end()
    .extensions.merge(['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm'])
    .end()
    .alias.set('@', resolve(cwd, 'src'))
    .end();

  webpackConfig.resolveLoader.modules
    .add('node_modules')
    .add(join(cwd, 'node_modules'))
    .end();

  if (opts.alias) {
    for (const key in opts.alias) {
      webpackConfig.resolve.alias.set(key, opts.alias[key]);
    }
  }

  // static assets -----------------------------------------------------------
  webpackConfig.module
    .rule('html')
    .test(/\.html?$/)
    .use('html-loader')
    .loader('html-loader');

  webpackConfig.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions('img'));

  webpackConfig.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .use('file-loader')
    .loader('file-loader')
    .options({
      name: genAssetSubPath('img'),
    });

  webpackConfig.module
    .rule('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions('media'));

  webpackConfig.module
    .rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
    .loader('url-loader')
    .options(genUrlLoaderOptions('fonts'));

  // node
  webpackConfig.node.merge({
    setImmediate: false,
    process: 'mock',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  });
}
