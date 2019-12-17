const path = require('path');

const instance = require('../libs/utils/cloneTemplate')(
  path.join(process.cwd(), 'test'),
  {
    projectName: 'test',
    framework: 'vue',
    build: 'multiple',
    // build: 'single',
    plugins: ['babel', 'eslint', 'vue-router'],
    vueMode: 'history'
  }
).init();