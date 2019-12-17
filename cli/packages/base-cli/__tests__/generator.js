
const Service = require('../libs/utils/Service');
const path = require('path');

let webpackrc = {
  framework: 'vue',
  plugins: [ '@mfw/base-cli-plugin-mpa' ]
};

let packageJson = {
  name: 'base-cli',
  version: '0.0.1',
  devDependencies: { },
  dependencies: { }
}

const service =  new Service(
  webpackrc,
  packageJson,
  path.join(process.cwd(), 'test'),
);

service.removePlugin('@mfw/base-cli-plugin-mpa');

// service.addPlugin('@mfw/base-cli-plugin-mpa');
// service.apply();