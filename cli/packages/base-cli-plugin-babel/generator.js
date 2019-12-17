exports.install = (api, options) => {
  api.render(
    'babel.config.js',
    'module.exports = ' +
      JSON.stringify(
        {
          presets: ['@mfw/app'],
        },
        null,
        2
      )
  );
  api.addPlugin('@mfw/base-cli-plugin-babel');
};
exports.uninstall = (api) => {
  api.remove('babel.config.js');
};
