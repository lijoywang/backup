const { join, extname, basename, dirname } = require('path');

/**
 *
 *
 * @param {pluginAPI} api
 * @param {object} [options]
 * {
 *  }
 */
module.exports = function(api, options = {}) {
  const { log, paths } = api;
  const isDev = process.env.NODE_ENV === 'development';

  api.registerCommand(
    'cz',
    {
      description: 'commit message',
    },
    (args) => {}
  );
};
