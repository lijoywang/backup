const path = require('path');

module.exports = (api, options) => {
  const fs = require('fs');

  api.chainWebpackConfig((config) => {
    config.resolveLoader.modules.prepend(path.join(__dirname, 'node_modules'));

    // if (!options.pages) {
    //   config
    //     .entry('app')
    //     .clear()
    //     .add('./src/main.ts');
    // }

    config
      .entry('app')
      .clear()
      .add('./src/main.ts');

    config.resolve.extensions.merge(['.ts', '.tsx']);

    const tsRule = config.module.rule('ts').test(/\.ts$/);
    const tsxRule = config.module.rule('tsx').test(/\.tsx$/);

    // add a loader to both *.ts & vue<lang="ts">
    const addLoader = ({ loader, options }) => {
      tsRule
        .use(loader)
        .loader(loader)
        .options(options);
      tsxRule
        .use(loader)
        .loader(loader)
        .options(options);
    };

    addLoader({
      loader: 'babel-loader',
    });

    addLoader({
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        appendTsSuffixTo: ['\\.vue$'],
      },
    });
    // make sure to append TSX suffix
    tsxRule
      .use('ts-loader')
      .loader('ts-loader')
      .tap((options) => {
        options = Object.assign({}, options);
        delete options.appendTsSuffixTo;
        options.appendTsxSuffixTo = ['\\.vue$'];
        return options;
      });
  });

  if (!api.hasPlugin('eslint')) {
    api.registerCommand(
      'lint',
      {
        description: 'lint source files with TSLint',
        usage: 'vue-cli-service lint [options] [...files]',
        options: {
          '--format [formatter]': 'specify formatter (default: codeFrame)',
          '--no-fix': 'do not fix errors',
          '--formatters-dir [dir]': 'formatter directory',
          '--rules-dir [dir]': 'rules directory',
        },
      },
      (args) => {
        return require('./lib/tslint')(args, api);
      }
    );
  }
};
