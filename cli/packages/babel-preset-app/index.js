const path = require('path');

const defaultPolyfills = [
  // promise polyfill alone doesn't work in IE,
  // needs this as well. see: #1642
  'es6.array.iterator',
  // this is required for webpack code splitting, vuex etc.
  'es6.promise',
  // this is needed for object rest spread support in templates
  // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
  'es6.object.assign',
  // #2012 es6.promise replaces native Promise in FF and causes missing finally
  'es7.promise.finally',
];

function getPolyfills(
  targets,
  includes,
  { ignoreBrowserslistConfig, configPath }
) {
  const { isPluginRequired } = require('@babel/preset-env');
  const builtInsList = require('@babel/preset-env/data/built-ins.json');
  const getTargets = require('@babel/preset-env/lib/targets-parser').default;
  const builtInTargets = getTargets(targets, {
    ignoreBrowserslistConfig,
    configPath,
  });

  return includes.filter((item) => {
    return isPluginRequired(builtInTargets, builtInsList[item]);
  });
}

module.exports = (context, options = {}) => {
  const presets = [];
  const plugins = [];

  presets.push([require('@vue/babel-preset-jsx'), {}]);

  const {
    polyfills: userPolyfills,
    loose = false,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    targets: rawTargets, //
    spec = false, //
    ignoreBrowserslistConfig = false,
    configPath = process.cwd(), //
    include = [], //
    exclude,
    shippedProposals = false, //
    forceAllTransforms = false, //
    decoratorsBeforeExport,
    decoratorsLegacy,
  } = options;

  let targets = rawTargets;

  // included-by-default polyfills. These are common polyfills that 3rd party
  // dependencies may rely on (e.g. Vuex relies on Promise), but since with
  // useBuiltIns: 'usage' we won't be running Babel on these deps, they need to
  // be force-included.
  let polyfills;
  if (useBuiltIns === 'usage') {
    polyfills = getPolyfills(targets, userPolyfills || defaultPolyfills, {
      ignoreBrowserslistConfig,
      configPath,
    });
    plugins.push([require('./polyfillsPlugin'), { polyfills }]);
  }

  const envOptions = {
    spec, //
    loose,
    debug,
    modules,
    targets, //
    useBuiltIns,
    corejs: 2,
    ignoreBrowserslistConfig,
    configPath, //
    include, //
    exclude: polyfills.concat(exclude || []),
    shippedProposals, //
    forceAllTransforms, //
  };

  // pass options along to babel-preset-env
  presets.unshift([require('@babel/preset-env'), envOptions]);

  // additional <= stage-3 plugins
  // Babel 7 is removing stage presets altogether because people are using
  // too many unstable proposals. Let's be conservative in the defaults here.
  plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [
      require('@babel/plugin-proposal-decorators'),
      {
        decoratorsBeforeExport,
        legacy: decoratorsLegacy !== false,
      },
    ],
    [require('@babel/plugin-proposal-class-properties'), { loose }]
  );

  // transform runtime, but only for helpers
  plugins.push([
    require('@babel/plugin-transform-runtime'),
    {
      regenerator: useBuiltIns !== 'usage',
      // use @babel/runtime-corejs2 so that helpers that need polyfillable APIs will reference core-js instead.
      // if useBuiltIns is not set to 'usage', then it means users would take care of the polyfills on their own,
      // i.e., core-js 2 is no longer needed.
      corejs: useBuiltIns === 'usage' ? 2 : false,
      helpers: useBuiltIns === 'usage',
      useESModules: true,
      absoluteRuntime: path.dirname(
        require.resolve('@babel/runtime/package.json')
      ),
    },
  ]);

  return {
    presets,
    plugins,
  };
};
