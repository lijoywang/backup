export default function(webpackConfig, opts) {
  // vue-loader --------------------------------------------------------------
  webpackConfig.resolve.alias.set(
    'vue$',
    opts.runtimeCompiler ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js'
  );

  webpackConfig.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
    .loader('vue-loader')
    .options({
      compilerOptions: {
        preserveWhitespace: false,
      },
    });

  webpackConfig.plugin('vue-loader').use(require('vue-loader/lib/plugin'));
}
