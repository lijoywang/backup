exports.config = (api) => {
  const config = {
    root: true,
    env: { browser: true, es6: true, node: true },
    extends: [],
    rules: {},
  };
  config.parserOptions = {
    parser: 'babel-eslint',
    sourceType: 'module',
  };
  return config;
};
