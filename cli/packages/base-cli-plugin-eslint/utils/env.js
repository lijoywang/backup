const { execSync } = require('child_process');

let _hasGit;

exports.hasGit = () => {
  if (_hasGit != null) {
    return _hasGit;
  }
  try {
    execSync('git --version', { stdio: 'ignore' });
    return (_hasGit = true);
  } catch (e) {
    return (_hasGit = false);
  }
};
