import Config from 'webpack-chain';
import assert from 'assert';

/**
 *
 *
 * @export
 * @param {*} opts { cwd, entry, outputPath, publicPath,  }
 * @returns
 */
export default function(opts = {}) {
  const isDev = process.env.NODE_ENV === 'development';
  const webpackConfig = new Config();

  require('./base').default(webpackConfig, opts);

  require('./css').default(webpackConfig, opts);

  require('./plugin').default(webpackConfig, opts);

  if (opts.framework === 'vue') {
    require('./vueLoader').default(webpackConfig, opts);
  }

  if (isDev) {
    require('./dev').default(webpackConfig, opts);
  } else {
    require('./prod').default(webpackConfig, opts);
  }

  if (opts.chainConfig) {
    assert(
      typeof opts.chainConfig === 'function',
      `opts.chainConfig should be function, but got ${opts.chainConfig}`
    );
    opts.chainConfig(webpackConfig);
  }
  let config = webpackConfig.toConfig();

  if (process.env.SPEED_MEASURE) {
    const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
    const smpOption = process.env.SPEED_MEASURE === 'CONSOLE'
      ? { outputFormat: 'human', outputTarget: console.log }
      : { outputFormat: 'json', outputTarget: join(process.cwd(), 'speed-measure.json') };
    const smp = new SpeedMeasurePlugin(smpOption);
    config = smp.wrap(config);
  }
  return config;
}
