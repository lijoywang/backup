const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const chalk = require('chalk');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const HappyPack = require('happypack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// const TransformModulesPlugin = require('webpack-transform-modules-plugin');

const getHappyPackConfig = require('./happypack');
const config = require('../config');
const utils = require('./utils');

const IS_DEV = process.env.IS_DEV;
const env = process.env.NODE_ENV || 'development';
const apiPrefix = config[env].prefix;

console.log(
  '---------env------:',
  env,
  '------apiPrefix-------:',
  `${config[env].prefix}.${config[env].domain}`
);

module.exports = {
  mode: env,
  entry: utils.createEntry(config[env].multipleEntry),
  context: utils.resolve('src'),
  module: {
    // noParse: [/static|assets/],
    rules: [{
        test: /\.js$/,
        type: 'javascript/auto',
        exclude: /node_modules/,
        loader: 'happypack/loader?id=js'
      },
      {
        test: /\.vue$/,
        type: 'javascript/auto',
        // vue-loader 15 does not support happypack: https://github.com/vuejs/vue-loader/issues/1273
        use: [{
            loader: 'thread-loader',
            options: {
              workers: 2
            }
          },
          'vue-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        type: 'javascript/auto',
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]')
          }
        }]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'javascript/auto',
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  resolve: {
    extensions: ['.vue', '.js', '.json'],
    modules: [utils.resolve('node_modules')],
    alias: utils.createAlias({
      '@': utils.resolve('src'),
      '@components': utils.resolve('src/components'),
      vue$: 'vue/dist/vue.esm.js',
      'ant-ui': '@mfw/ant-ui/lib'
    })
  },

  resolveLoader: {
    modules: [utils.resolve('node_modules')]
  },

  performance: {
    hints: false
  },

  externals: {
    // vue: 'Vue'
  },

  stats: {
    children: false
  },

  plugins: [
    new HappyPack(
      getHappyPackConfig({
        id: 'js',
        loaders: [{
          path: 'babel-loader',
          query: {
            cacheDirectory: true
          }
        }]
      })
    ),

    new webpack.DefinePlugin({
      'process.env':JSON.stringify(env),
      'window.CUR_ENV': JSON.stringify(config[env].curEnv),
      'window.PREFIX': JSON.stringify(apiPrefix),
      'window.DOMAIN': JSON.stringify(
        IS_DEV ? 'mfwdev.com' : config[env].domain
      ),
      'window.ROUTER_BASE': JSON.stringify(config[env].historyBasePath)
    }),

    // copy assets
    new CopyWebpackPlugin([{
        context: '..',
        from: 'static/**/*',
        to: utils.resolve('public'),
        force: true,
        ignore: ['.*']
      },
      {
        context: '../src',
        from: 'assets/**/*',
        to: utils.resolve('public'),
        force: true,
        ignore: ['.*']
      },
      {
        context: '../src',
        from: 'pages/index.html',
        to: utils.resolve('public', config[env].multipleEntry.static),
        force: true
      }
    ]),

    // https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: 'index.html',
    //   inject: true,
    //   env: env,
    //   minify: {
    //     removeComments: true,
    //     collapseWhitespace: true,
    //     removeAttributeQuotes: false
    //   }
    // }),

    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    }),
    new VueLoaderPlugin(),
    // new TransformModulesPlugin(),
  ],
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};