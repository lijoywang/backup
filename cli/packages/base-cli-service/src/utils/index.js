[
  'exit',
  'logger',
  'getAssetPath',
  'openBrowser',
  'prepareUrls',
  'registerBabel',
  'resolveDefine',
  'resolveLoaderError',
  'spinner',
  'validate',
].forEach((m) => {
  Object.assign(exports, require(`./${m}`));
});
