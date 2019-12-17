
const Service = require('./Service');
const globby = require('globby');
const path = require('path');
const fs = require('fs-extra');
const write = require('./write');
const ejs = require('ejs');
const { customPlugins } = require('../config');

module.exports = (context, preset) => {
  let webpackrc = {
    framework: preset.framework,
    plugins: [ ]
  };

  let packageJson = {
    name: preset.projectName,
    version: '0.0.1',
    scripts: {
      'dev': 'HARD_SOURCE=true mfw-cli-service dev',
      'build': 'mfw-cli-service build'
    },
    dependencies: { },
    devDependencies: { }
  };

  const service = new Service(
    webpackrc,
    packageJson,
    context
  );
  // 添加插件
  const plugins = preset.plugins || [ ];
  if (plugins.length) {
    Object.keys(customPlugins).forEach(plugin => {
      if (plugins.includes(plugin)) {
        service.addPlugin(customPlugins[plugin], preset);
      }
    });
  }
  // 添加依赖
  if (preset.framework === 'vue') {
    service.install('vue-template-compiler');
    service.install('vue', '-S');

    if (preset.isRouter) {
      service.install('vue-router');
    }
  }

  if (preset.cssPreprocessors) {
    const cssPreprocessors = {
      sass: 'node-sass',
      less: 'node-less',
      stylus: 'stylus'
    }[preset.cssPreprocessors];

    service.install(cssPreprocessors);
  }

  return {
    async install() {
      await service.apply();
    },

    writePackage() {
      service.writePackage();
    },

    writeConfigFiles() {
      const cwd = path.join(__dirname, '../configure');
      const configs = globby.sync('.**|**' , { cwd });
      let output = { };

      configs.forEach(filename => {
        output[filename] = ejs.render(
          fs.readFileSync(path.join(cwd, filename), 'utf-8'),
          preset
        );
      });

      write(context, output);
    }
  }
};
