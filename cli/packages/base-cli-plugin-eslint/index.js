const path = require('path');

module.exports = (api) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Use loadModule to allow users to customize their ESLint dependency version.
  const { resolveModule } = require('./utils/module');
  const { cwd } = api.service;

  const baseExtensions = ['.js', '.jsx', '.vue'];

  api.chainWebpackConfig((webpackConfig) => {
    webpackConfig.resolveLoader.modules.prepend(
      path.join(__dirname, 'node_modules')
    );

    if (isDev) {
      webpackConfig.module
        .rule('eslint')
        .pre()
        .exclude.add(/node_modules/)
        .add(require('path').dirname(require.resolve('@mfw/base-cli-service')))
        .end()
        .test(/\.(vue|(j|t)sx?)$/)
        .use('eslint-loader')
        .loader('eslint-loader')
        .options({
          baseExtensions,
          cache: true,
          emitWarning: true,
          emitError: false,
          eslintPath: resolveModule('eslint', cwd) || require.resolve('eslint'),
          formatter: require('eslint-friendly-formatter'),
        });
    }
  });

  api.registerCommand(
    'lint',
    {
      description: 'lint and fix source files',
      usage: 'base-cli-service lint [options] [...files]',
      options: {
        '--format [formatter]': 'specify formatter (default: codeframe)',
        '--no-fix': 'do not fix errors',
        '--max-errors [limit]':
          'specify number of errors to make build failed (default: 0)',
        '--max-warnings [limit]':
          'specify number of warnings to make build failed (default: Infinity)',
      },
      details:
        'For more options, see https://eslint.org/docs/user-guide/command-line-interface#options',
    },
    (args) => {
      require('./lint')(args, api);
    }
  );
};
