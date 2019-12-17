"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _autoprefixer = _interopRequireDefault(require("autoprefixer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const DEFAULT_BROWSERS = ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'];

function _default(webpackConfig, opts) {
  const isDev = process.env.NODE_ENV === 'development';

  const cssOptions = _objectSpread({
    sourceMap: !opts.disableCSSSourceMap,
    importLoaders: 1
  }, opts.cssLoaderOptions || {});

  const postcssOptions = {
    ident: 'postcss',
    plugins: () => [require('postcss-flexbugs-fixes'), (0, _autoprefixer.default)(_objectSpread({
      browsers: opts.browserslist || DEFAULT_BROWSERS,
      flexbox: 'no-2009'
    }, opts.autoprefixer || {})), ...(opts.extraPostCSSPlugins ? opts.extraPostCSSPlugins : [])]
  };

  const lessOptions = _objectSpread({
    javascriptEnabled: true
  }, opts.lessLoaderOptions || {});

  function applyCSSRules(rule, {
    less,
    sass
  }) {
    if (isDev) {
      // js加载前css热重载
      // github.com/shepherdwind/css-hot-loader
      https: rule.use('css-hot-loader').loader(require.resolve('css-hot-loader'));
    }

    rule.use('extract-css-loader').loader(require('mini-css-extract-plugin').loader).options({
      publicPath: isDev ? '/' : opts.cssPublicPath
    });
    rule.use('css-loader').loader(require.resolve('css-loader')).options(cssOptions);
    rule.use('postcss-loader').loader(require.resolve('postcss-loader')).options(postcssOptions);

    if (less) {
      rule.use('less-loader').loader(require.resolve('less-loader')).options(lessOptions);
    }

    if (sass) {
      rule.use('sass-loader').loader(require.resolve('sass-loader')).options(opts.sass);
    }
  }

  function cssExclude(filePath) {
    return /node_modules/.test(filePath);
  }

  applyCSSRules(webpackConfig.module.rule('css').test(/\.css$/), {});
  applyCSSRules(webpackConfig.module.rule('less').test(/\.less$/), {
    less: true
  });
  applyCSSRules(webpackConfig.module.rule('sass').test(/\.(sass|scss)$/), {
    sass: true
  });
  const hash = isDev ? '' : '.[contenthash:8]';
  webpackConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [{
    filename: `css/[name]${hash}.css`,
    chunkFilename: `css/[name]${hash}.chunk.css`
  }]);
}