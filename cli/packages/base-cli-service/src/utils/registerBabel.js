const { join, isAbsolute } = require('path');
const { flatten } = require('lodash');
import { CONFIG_FILES } from '../constants';
let files = null;

function initFiles() {
  if (files) return;
  const env = process.env.MFW_ENV;
  files = [
    ...flatten(
      CONFIG_FILES.concat('config/').map((file) => [
        file,
        ...(env ? [file.replace(/\.js$/, `.${env}.js`)] : []),
        file.replace(/\.js$/, `.local.js`),
      ])
    ),
  ];
}

exports.addBabelRegisterFiles = function(extraFiles) {
  initFiles();
  files.push(...extraFiles);
};

exports.registerBabel = (opts = {}) => {
  initFiles();
  const { cwd } = opts;
  const only = files.map((f) => {
    const fullPath = isAbsolute(f) ? f : join(cwd, f);
    return fullPath;
  });

  const babelPreset = [
    'env',
    {
      targets: {
        node: 'current',
      },
    },
  ];

  if (process.env.NODE_ENV !== 'test') {
    require('@babel/register')({
      presets: [babelPreset],
      only,
      babelrc: false,
      cache: false,
    });
  }
};
