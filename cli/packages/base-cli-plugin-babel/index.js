const path = require('path');

module.exports = (api, options = {}) => {
  const cliServicePath = require('path').dirname(
    require.resolve('@mfw/base-cli-service')
  );

  api.chainWebpackConfig((webpackConfig) => {
    const jsRule = webpackConfig.module
      .rule('js')
      .test(/\.jsx?$/)
      .exclude.add((filepath) => {
        // always transpile js in vue files
        if (/\.vue\.jsx?$/.test(filepath)) {
          return false
        }
        if (filepath.startsWith(cliServicePath)) {
          return true;
        }
        return /node_modules/.test(filepath);
      })
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .end();
    if (process.env.NODE_ENV === 'production' && options.parallel) {
      jsRule.use('thread-loader').loader('thread-loader');
    }
  });
};
