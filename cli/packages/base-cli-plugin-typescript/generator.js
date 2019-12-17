module.exports = (
  api,
  { classComponent, tsLint, lintOn = [] },
  _,
  invoking
) => {
  if (typeof lintOn === 'string') {
    lintOn = lintOn.split(',');
  }

  api.extendPackage({
    devDependencies: {
      typescript: '~3.1.1',
    },
  });

  if (classComponent) {
    api.extendPackage({
      dependencies: {
        'vue-class-component': '^6.0.0',
        'vue-property-decorator': '^7.0.0',
      },
    });
  }

  if (tsLint) {
    api.extendPackage({
      scripts: {
        lint: 'vue-cli-service lint',
      },
    });

    if (!lintOn.includes('save')) {
      api.extendPackage({
        vue: {
          lintOnSave: false,
        },
      });
    }
  }

  api.render('./template', {
    isTest: false,
  });

  require('./generator/convert')(api, { tsLint });
};
