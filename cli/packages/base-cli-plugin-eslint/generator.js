const fs = require('fs');
const path = require('path');

exports.install = (api, ops) => {
  const eslintConfig = require('./eslintOptions').config(api);

  const ignorePath = path.resolve(__dirname, `./template/ignore/_eslintignore`);
  const ignoreConfig = fs.readFileSync(ignorePath, 'utf-8');

  const pkg = {
    scripts: {
      lint: 'mfw-cli-service lint',
    },
    devDependencies: {
      'babel-eslint': '^10.0.1',
      eslint: '^5.8.0',
    },
  };

  const injectEditorConfig = (config) => {
    const configPath = path.resolve(
      __dirname,
      `./template/${config}/_editorconfig`
    );
    const editorconfig = fs.readFileSync(configPath, 'utf-8');
    api.render('.editorconfig', editorconfig);
  };

  if (ops.framework === 'vue') {
    eslintConfig.extends.push('plugin:vue/essential');
    Object.assign(pkg.devDependencies, {
      'eslint-plugin-vue': '^5.0.0',
    });
  }

  eslintConfig.extends.push('@mfw/prettier');
  Object.assign(pkg.devDependencies, {
    '@mfw/eslint-config-prettier': '^0.0.1',
  });
  injectEditorConfig('prettier');

  Object.assign(pkg.devDependencies, {
    'lint-staged': '^8.1.0',
  });
  pkg.gitHooks = {
    'pre-commit': 'lint-staged',
  };
  pkg['lint-staged'] = {
    '*.js': ['mfw-cli-service lint', 'git add'],
    '*.vue': ['mfw-cli-service lint', 'git add'],
  };

  Object.assign(pkg.devDependencies, {
    'eslint-friendly-formatter': '^4.0.1',
  });

  api.extendPackage(pkg);
  api.addPlugin('@mfw/base-cli-plugin-eslint');
  api.render(
    '.eslintrc.js',
    'module.exports = ' + JSON.stringify(eslintConfig, null, 2)
  );
  api.render('.eslintignore', ignoreConfig);

  // what
  // // lint & fix after create to ensure files adhere to chosen config
  // if (config && config !== 'base') {
  //   api.onCreateComplete(() => {
  //     require('./lint')({ silent: true }, api);
  //   });
  // }
};
exports.uninstall = (api) => {
  api.remove('.eslintrc.js');
  api.remove('.editorconfig');
  api.remove('.eslintignore');
  api.modifyPkg(pkg => {
    delete pkg.scripts['lint'];
    delete pkg.devDependencies['babel-eslint'];
    delete pkg.devDependencies['eslint'];
    delete pkg.devDependencies['eslint-plugin-vue'];
    delete pkg.devDependencies['@mfw/eslint-config-prettier'];
    delete pkg.devDependencies['lint-staged'];
    delete pkg.devDependencies['eslint-friendly-formatter'];
    delete pkg['gitHooks'];
    delete pkg['lint-staged'];
    return pkg;
  });
};
