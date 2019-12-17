"use strict";

const BASE_FRAMEWORKS = ['vue', 'react', 'weex', 'html', 'js'];

exports.getFramework = baseDir => {
  const pkgFile = path.join(baseDir, 'package.json');

  const pkg = require(pkgFile);

  return r.find(framework => {
    return pkg.dependencies[framework] || pkg.devDependencies[framework];
  });
};