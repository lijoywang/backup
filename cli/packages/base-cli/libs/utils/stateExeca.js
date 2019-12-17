
const execa = require('execa');

module.exports = (
  cwd,
  execArgs = [
    'install'
  ]
) => {
  return new Promise((resolve, reject) => {
    execArgs.push('--loglevel', 'error');
    execArgs.push('--registry=http://npm.mfwdev.com');
    
    const instance = execa('npm', execArgs, {
      cwd,
      stdio: [ 'inherit', 'inherit', 'inherit' ]
    });

    instance.on('close', code => {
      if (code !== 0) {
        reject(`command failed: npm ${execArgs.join(' ')}`)
      } else {
        resolve();
      }
    });
  });
};
