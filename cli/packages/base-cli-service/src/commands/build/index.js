import build from './build';
const { info, done, logWithSpinner } = require('../../utils');



export default function(api) {
  const { service, log, debug } = api;
  const { cwd, mode } = service;
  api.registerCommand(
    'build',
    {
      webpack: true,
    },
    (args = {}) => {
      let server = null;
      const { port } = args;
      process.env.NODE_ENV = 'production';
      service.applyPlugins('onStart');
      logWithSpinner(`Building for ${mode}...`)

      return new Promise((resolve, reject) => {
        return build({
          cwd,
          webpackConfig: service.webpackConfig,
          onSuccess({ stats }) {
            debug('Build success');
            service.applyPlugins('onBuildSuccess', {
              args: {
                stats,
              },
            });
            debug('Build success end');
            resolve();
          },
          onFail({ err, stats }) {
            service.applyPlugins('onBuildFail', {
              args: {
                err,
                stats,
              },
            });
            reject(err);
          },
        });
      });
    }
  );
}
