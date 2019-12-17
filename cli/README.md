# fe-cli

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## 前端项目脚手架

---
## CLI使用指南

### 首先从私有源全局安装CLI

```bash
$ npm i npm i -g @mfw/base-cli --registry=http://npm.mfwdev.com
```
### 初始化一个项目

```bash
$ mfwcli create new-project  # 使用create命令启动交互式命令行
```
### 其他功能


```bash
$ mfwcli -h          # 查看支持的命令
$ mfwcli install     # 安装CLI插件
$ mfwcli uninstall   # 卸载安装的插件
$ mfwcli add         # 针对多入口项目创建入口模板
```


## 配置文件

```js
// 配置文件放在和package.json同级的根目录下
// 文件支持JSON, js格式
// .webpackrc.js 或者 .webpackrc.json
{
  // 使用框架模板
  framework: '',
  // webpack alias
  alias: {},
  // 
  baseUrl: '',
  // where to output built files
  outputPath: '',
  // where to put static assets (js/css/img/font/...)
  assetsPath: '',
  // boolean, vue 是否编译完整版本
  runtimeCompiler: false,
  // js 压缩引擎
  minimizer:'',
  // devServer配置
  devServer: {},
  // 使用插件列表
  plugins: [],
  // 通过 webpack-chain 的 API 扩展或修改 webpack 配置。
  chainWebpack: ()=>{},
  // sass-loader options
  sass: {}
}
```
## 插件开发

### 初始化插件

插件实际上就是一个 JS 模块，你需要定义一个插件的初始化方法并默认导出。如下示例

```js
export default (api, opts) => {
  // plugin code
};
```

该初始化方法会收到两个参数，第一个参数 `api`，`cli service` 提供给插件的接口都是通过它暴露出来的。第二个参数 opts 是用户在初始化插件的时候填写的。

### 插件接口简介

> 所有插件接口都是通过初始化插件时候的 api 来提供的。分为如下几类：

- 环境变量，插件中可以使用的一些环境变量
- 系统级变量，一些插件系统暴露出来的变量或者常量
- 工具类 API，常用的一些工具类方法
- 系统级 API，一些插件系统暴露的核心方法
- 事件类 API，一些插件系统提供的关键的事件点
- 应用类 API，用于实现插件功能需求的 API，有直接调用和函数回调两种方法

注： 所有的 API 都是通过 `api.[apiName]` 的方法使用的，内部的 API 会统一加上 \_ 的前缀。

下面是一个基本的使用示例：

```
export default (api, opts) => {
  api.onOptionChange(()=>{
    api.restart()
  })
};
```

### 环境变量

#### NODE_ENV

`process.env.NODE_ENV`，区分 development 和 production

### 系统变量

#### config

从用户配置文件中读取的配置

### 系统 API

#### registerPlugin

加载插件，用于需要在一个插件中加载其它插件的场景。

#### registerMethod

注册插件方法，用于给插件添加新的方法给其它插件使用。

#### applyPlugins

在插件用应用通过 registerMethod 注册的某个方法。

#### restart

 重新启动 dev server

#### refreshBrowser

刷新浏览器

#### rebuildHTML

触发 HTML 重新构建。

#### registerCommand

 注册 cli 命令行，比如在 cli 内部 dev 命令就是这么实现的

```js
api.registerCommand('dev', {}, () => {
  // code
});
```

### 工具 API

#### log

```js
api.log.success('Done');
api.log.error('Error');
api.log.error(new Error('Error'));
api.log.debug('Hello', 'from', 'L59');
api.log.pending('Write release notes for %s', '1.2.0');
api.log.watch('Recursively watching build directory...');
```

输出[各种类型](https://github.com/klaussinani/signale/blob/94984998a0e9cb280e68959ddd9db70b49713738/types.js#L4)的日志。

#### debug

```js
api.debug('msg');
```

### 事件类 API

> 事件类 API 遵循以 onXxxXxx, beforeXxx, afterXxx 的命名规范，接收一个参数为回调函数。

#### beforeDevServer

dev server 启动之前。

#### afterDevServer

dev server 启动之后。

#### onStart

cli dev 或者 cli build 开始时触发。

#### onOptionChange

插件的配置改变的时候触发。

#### onHTMLRebuild

当 HTML 重新构建时被触发。

### 应用类 API

#### chainWebpackConfig

修改 webpack 配置。
