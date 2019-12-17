const { depVersion } = require('../config');

module.exports = (dep) => `${depVersion[dep] || 'latest'}`;