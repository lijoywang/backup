
const getDepVersion = require('./getDepVersion');
const write = require('./write');
const stateExeca = require('./stateExeca');
const _ = require('lodash');

class PackageJson {
  constructor(packageJson, context) {
    this.packageJson = packageJson;
    this.context = context;
  }

  isExistDep(dep) {
    return this.packageJson.devDependencies[dep]
      || this.packageJson.dependencies[dep];
  }

  setDevDependencies(dep) {
    if (typeof dep === 'string') {
      this.extendPackage({
        devDependencies: {
          [dep]: getDepVersion(dep)
        }
      });
    } else {
      this.extendPackage(dep);
    }
  }

  setDependencies(dep) {
    if (typeof dep === 'string') {
      this.extendPackage({
        dependencies: {
          [dep]: getDepVersion(dep)
        }
      });
    } else {
      this.extendPackage(dep);
    }
  }

  extendPackage(packageName) {
    _.merge(this.packageJson, packageName);
  }

  writePackage() {
    write(this.context, {
      'package.json': JSON.stringify(this.packageJson, null, 2)
    });
  }

  removeDep(dep) {
    if (this.packageJson.dependencies[dep]) {
      delete this.packageJson.dependencies[dep];
    }

    if (this.packageJson.devDependencies[dep]) {
      delete this.packageJson.devDependencies[dep];
    }
  }

  delProperty(property) {
    if (this.packageJson[property] !== undefined) {
      delete this.packageJson[property];
    }
  }
};

module.exports = PackageJson;
