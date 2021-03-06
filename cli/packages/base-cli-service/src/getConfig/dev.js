import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'

export default function(webpackConfig, opts) {
   // mode
  webpackConfig.mode('development');
  webpackConfig
    .devtool(opts.devtool || 'cheap-module-eval-source-map') // https://webpack.docschina.org/configuration/devtool/
    .output.pathinfo(true)

  webpackConfig
    .plugin('hmr')
    .use(require('webpack/lib/HotModuleReplacementPlugin'))
  

  webpackConfig
    .plugin('no-emit-on-errors')
    .use(require('webpack/lib/NoEmitOnErrorsPlugin'))

  webpackConfig.when(!!opts.devServer, webpackConfig =>
    webpackConfig.merge({ devServer: opts.devServer })
  )

  // 加快二次构建速度 https://github.com/mzgoddard/hard-source-webpack-plugin
  if (process.env.HARD_SOURCE) {
    const pkgPath = join(opts.cwd, 'package.json')
    if (!existsSync(pkgPath)) {
      writeFileSync(pkgPath, '{}', 'utf-8')
    }
    webpackConfig
      .plugin('hard-source')
      .use(require('hard-source-webpack-plugin'), [
        {
          environmentHash: {
            root: process.cwd(),
            directories: ['config'],
            files: ['package-lock.json', 'yarn.lock']
          }
        }
      ])
  }
}
