const path = require('path')

exports.getAssetPath = (opts, filePath, placeAtRootIfRelative) => {
  return opts.assetsPath ? path.posix.join(opts.assetsPath, filePath) : filePath
}
