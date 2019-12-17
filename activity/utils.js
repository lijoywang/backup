const path = require('path');
const glob = require('glob');
// const crypto = require('crypto');
const md5 = require('md5')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('../config');

const env = process.env.NODE_ENV || 'development';

function resolve(dir, file = '') {
  return path.join(__dirname, '..', dir, file);
}

// function md5(content) {
//   return crypto
//     .createHash('md5')
//     .update(content)
//     .digest('hex')
//     .substr(0, 7);
// }

// name 换取 key 值
function name2key(result = {}) {
  return {
    getKey: (name) => {
      const key = md5(name);
      result[key] = name;
      return key;
    },
    getName: (key) => {
      return result[key];
    },
  };
}
const name2keyInstance = name2key({});

function assetsPath(_path) {
  const assetsSubDirectory = config[env].assetsSubDirectory;
  return path.posix.join(assetsSubDirectory, _path);
}

const createEntry = (options = {}, noHMR) => {
  const { root, page, file, exclude } = options;

  let entries = {};
  let files = [];
  // 支持多入口启动 eg: NODE_PACKAGE='activity_qList, dt_destination'
  if (page.indexOf(',') > -1) {
    page
      .replace(/\s/g, '')
      .split(',')
      .forEach((item) => {
        files = files.concat(glob.sync(path.join(root, item, file)));
      });
  } else {
    files = glob.sync(path.join(root, page, file));
  }
  files.forEach((entry, index) => {
    // eg: /Users/wanglijun/project/activity/src/pages/reserve_note/pages/main.js
    // result: reserve_note/pages
    const foldername = path.dirname(
      entry.replace(root, '').replace(/^\//gi, ''),
    );

    if (!(exclude && foldername.match(exclude))) {
      const key = name2keyInstance.getKey(foldername);
      entries[`${key}`] =
        env === 'development' && !noHMR
          ? [
            'webpack/hot/dev-server',
            `webpack-dev-server/client?http://localhost:${config[env].port}/`,
            entry,
          ]
          : entry;
    }
  });

  return entries;
};

const createAlias = (options = {}) => {
  let files = glob.sync(resolve('src/pages/*'));
  let alias = { ...options };
  files.forEach((item, index) => {
    let pageName = item.split('/').splice(-1)[0];
    if (!/\./.test(pageName)) {
      alias[`@${pageName}`] = item;
    }
  });
  return alias;
};

// 定义history访问规则
const createHistoryApiRules = (options = {}) => {
  let entrys = createEntry(options, true);
  let rules = {};
  rules.rewrites = [];
  Object.keys(entrys).forEach((key) => {
    const foldername = name2keyInstance.getName(key);
    let pattern = new RegExp(`^\\/${foldername}\\/*`, 'g');
    rules.rewrites.push({
      from: pattern,
      to: `${config[env].assetsPublicPath}${foldername}/index.html`,
    });
  });
  rules.index = rules.rewrites[0].to;
  return rules;
};

function cssLoaders(options) {
  options = options || {};
  // const loaderKey = env === 'development' ? 'loader' : 'path'
  // const optionsKey = env === 'development' ? 'options' : 'query'
  const loaderKey = 'loader';
  const optionsKey = 'options';
  const cssLoader = {
    [loaderKey]: 'css-loader',
    [optionsKey]: {
      sourceMap: options.sourceMap,
      minimize: env !== 'development',
      importLoaders: 1,
    },
  };

  const postcssLoader = {
    [loaderKey]: 'postcss-loader',
    [optionsKey]: {
      sourceMap: options.sourceMap,
    },
  };

  const px2remLoader = {
    loader: 'px2rem-loader',
    options: {
      remUnit: 75,
    },
  };

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    const loaders = options.usePostCSS
      ? [cssLoader, postcssLoader]
      : [cssLoader];

    if (loader) {
      loaders.push({
        [loaderKey]: loader + '-loader',
        [optionsKey]: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap,
        }),
      });
    }

    // (which is the case during production build)
    if (options.extract) {
      return [MiniCssExtractPlugin.loader].concat(loaders);
    } else {
      return ['vue-style-loader'].concat(loaders);
    }
  }

  return {
    css: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', {
      indentedSyntax: true,
    }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus'),
  };
}

function styleLoaders(options) {
  const output = [];
  const loaders = cssLoaders(options);

  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader,
    });
  }

  return output;
}

module.exports = {
  md5: md5,
  name2key: name2keyInstance,
  resolve: resolve,
  assetsPath: assetsPath,
  createEntry: createEntry,
  createAlias: createAlias,
  createHistoryApiRules: createHistoryApiRules,
  styleLoaders: styleLoaders,
};
