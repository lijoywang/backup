const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const PluginError = require('plugin-error');
const portfinder = require('portfinder');
const fintLocalIp = require('my-local-ip');
const { info, openBrowser } = require('@vue/cli-shared-utils');

const { name2key } = require('./utils');
const webpackDevConfig = require('./webpack.dev.config.js');
const config = require('../config/index');
const options = {
  contentBase: './public',
  hot: true,
  host: '0.0.0.0',
};

WebpackDevServer.addDevServerEntrypoints(webpackDevConfig, options);
info('Starting development server...');

const compiler = webpack(webpackDevConfig);
const server = new WebpackDevServer(compiler, webpackDevConfig.devServer);

const env = process.env.NODE_ENV || 'development';
let url = `http://${config[env].host}:${config[env].port}/`;
let successMsg = '';

function getFolderName(entry) {
  const cwd = process.cwd();
  let folder = '';
  if (entry) {
    Object.keys(entry).map((key) => {
      folder = name2key.getName(key);
    });
  }
  return folder;
}

function compiledFail() {
  console.log(chalk.white('Webpack 编译失败: \n'));
}

portfinder.basePort = config[env].port;
portfinder.getPort((err, port) => {
  if (err) {
    compiledFail();
    throw new PluginError('[webpack build err]', err);
  } else {
    let folder = getFolderName(webpackDevConfig.entry);
    url = `http://${config[env].host}:${port}/${folder}`;
    successMsg = `
      - Local: http://${config[env].host}:${port}/${folder}
      - Network: http://${fintLocalIp()}:${port}/${folder} 
    `;

    server.listen(port, config[env].host, (err) => {
      if (err) {
        compiledFail();
        throw new PluginError('[webpack-dev-server err]', err);
      }
    });
  }
});

// 编译完成
compiler.plugin('done', (stats) => {
  openBrowser(url);
  setTimeout(() => {
    console.log(
      chalk.blue.bold(
        `\nWebpack 编译成功, open browser to visit ${successMsg}\n`,
      ),
    );
  }, 300);
});

// 编译失败
compiler.plugin('failed', (err) => {
  compiledFail();
  throw new PluginError('[webpack build err]', err);
});

// 监听文件修改
// compiler.plugin('compilation', compilation => {})
