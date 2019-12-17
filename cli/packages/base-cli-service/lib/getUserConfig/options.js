"use strict";

const _require = require('../utils'),
      createSchema = _require.createSchema,
      validate = _require.validate;

const schema = createSchema(joi => joi.object({
  framework: joi.string().valid(['', 'vue', 'react']),
  baseUrl: joi.string().allow(''),
  publicPath: joi.string().allow(''),
  outputPath: joi.string(),
  assetsPath: joi.string().allow(''),
  devServer: joi.object(),
  alias: joi.object(),
  minimizer: joi.string().valid(['', 'terserjs']),
  // js 压缩插件 可选terserjs
  runtimeCompiler: joi.boolean(),
  // vue 编译完整版本
  // 加载的插件
  plugins: joi.array(),
  // webpack
  chainWebpack: joi.func(),
  sass: joi.object()
}));

exports.validate = (options, cb) => {
  validate(options, schema, cb);
};

exports.defaults = () => ({
  baseUrl: '/',
  // where to output built files
  outputPath: 'public',
  // where to put static assets (js/css/img/font/...)
  assetsPath: '',
  // boolean, vue 是否编译完整版本
  runtimeCompiler: false,
  devServer: {}
});