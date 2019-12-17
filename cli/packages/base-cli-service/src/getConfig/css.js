import autoprefixer from 'autoprefixer';

const DEFAULT_BROWSERS = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9', // React and Vue doesn't support IE8 anyway
];

export default function(webpackConfig, opts) {
  const isDev = process.env.NODE_ENV === 'development';

  const cssOptions = {
    sourceMap: !opts.disableCSSSourceMap,
    importLoaders: 1,
    ...(opts.cssLoaderOptions || {}),
  };
  const postcssOptions = {
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'),
      autoprefixer({
        overrideBrowserslist: opts.browserslist || DEFAULT_BROWSERS,
        flexbox: 'no-2009',
        ...(opts.autoprefixer || {}),
      }),
      ...(opts.extraPostCSSPlugins ? opts.extraPostCSSPlugins : []),
    ],
  };

  const lessOptions = {
    javascriptEnabled: true,
    ...(opts.lessLoaderOptions || {}),
  };

  function applyCSSRules(rule, { less, sass }) {
    if (isDev) {
      // js加载前css热重载
      // github.com/shepherdwind/css-hot-loader
      rule.use('css-hot-loader').loader(require.resolve('css-hot-loader'));
    }

    rule
      .use('extract-css-loader')
      .loader(require('mini-css-extract-plugin').loader)
      .options({
        publicPath: isDev ? '/' : opts.cssPublicPath,
      });

    rule
      .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options(cssOptions);

    rule
      .use('postcss-loader')
      .loader(require.resolve('postcss-loader'))
      .options(postcssOptions);

    if (less) {
      rule
        .use('less-loader')
        .loader(require.resolve('less-loader'))
        .options(lessOptions);
    }

    if (sass) {
      rule
        .use('sass-loader')
        .loader(require.resolve('sass-loader'))
        .options(opts.sass);
    }
  }

  function cssExclude(filePath) {
    return /node_modules/.test(filePath);
  }

  applyCSSRules(webpackConfig.module.rule('css').test(/\.css$/), {});
  applyCSSRules(webpackConfig.module.rule('less').test(/\.less$/), {
    less: true,
  });
  applyCSSRules(webpackConfig.module.rule('sass').test(/\.(sass|scss)$/), {
    sass: true,
  });

  const hash = isDev ? '' : '.[contenthash:8]';
  webpackConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [
    {
      filename: `css/[name]${hash}.css`,
      chunkFilename: `css/[name]${hash}.chunk.css`,
    },
  ]);
}
