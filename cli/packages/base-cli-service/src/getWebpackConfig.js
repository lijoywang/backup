import getConfig from './getConfig';

export default function(service) {
  const { config } = service;
  const webpackOpts = {
    cwd: service.cwd,
    ...config,
    chainConfig: (webpackConfig) => {
      service.applyPlugins('chainWebpackConfig', {
        args: webpackConfig,
      });
      if (config.chainWebpack) {
        config.chainWebpack(webpackConfig, {
          webpack: require('webpack'),
        });
      }
    },
  };
  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: getConfig(webpackOpts),
  });
}
