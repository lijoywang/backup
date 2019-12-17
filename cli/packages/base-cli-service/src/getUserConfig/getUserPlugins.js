import resolve from 'resolve';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { codeFrameColumns } from '@babel/code-frame';
const debug = require('debug')('plugins:');
// const { registerBabel, addBabelRegisterFiles } = require('../utils');

export default function getUserPlugins(opts) {
  const { plugins, cwd } = opts;
  debug('pluginOpts', opts);
  const pluginPaths = pluginToPath(plugins, { cwd });
  debug('pluginPaths', pluginPaths);
  // TODO:用户插件需要做 babel 转换,
  // 当前与babelrc中配置存在冲突，暂时关闭
  // if (pluginPaths.length) {
  //   addBabelRegisterFiles(pluginPaths.map((p) => p[0]));
  //   registerBabel({
  //     cwd,
  //   });
  // }

  return pluginPaths.map((p) => {
    const [path, opts] = p;
    let apply;
    try {
      apply = require(path); // eslint-disable-line
    } catch (e) {
      throw new Error(
        `
Plugin ${chalk.cyan.underline(path)} require failed

${getCodeFrame(e)}
      `.trim()
      );
    }
    return {
      id: path.replace(makesureLastSlash(cwd), 'user:'),
      apply: apply.default || apply,
      opts,
    };
  });
}

function pluginToPath(plugins, { cwd }) {
  return (plugins || []).map((p) => {
    if (typeof p === 'string') {
      p = [p];
    }
    debug('pluginToPath', p);

    const [path, opts] = p;
    try {
      return [
        resolve.sync(path, {
          basedir: cwd,
        }),
        opts,
      ];
    } catch (e) {
      throw new Error(
        `
Plugin ${chalk.underline.cyan(path)} can't be resolved

   Please try the following solutions:

     1. checkout the plugins config in your config file
     ${
       path.charAt(0) !== '.' && path.charAt(0) !== '/'
         ? `2. install ${chalk.underline.cyan(path)} via npm/yarn`
         : ''
     }
`.trim()
      );
    }
  });
}

function makesureLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}

function hasCodeFrame(stack) {
  return stack.includes('^') && stack.includes('>');
}

function getCodeFrame({ stack, message }, options = {}) {
  const { codeFrame = {}, cwd } = options;
  if (hasCodeFrame(stack)) {
    return message;
  }

  // console.log(stack);
  const re = /at[^(]+\(([^:]+):(\d+):(\d+)\)/;
  const m = stack.match(re);
  if (m) {
    // eslint-disable-next-line no-unused-vars
    const [_, file, line, column] = m;
    if (!file.startsWith('.') && !file.startsWith('/')) {
      return message;
    }
    const rawLines = readFileSync(file, 'utf-8');
    if (file.startsWith(cwd)) {
      return [
        `${file}: ${message} (${line}, ${column})`,
        codeFrameColumns(
          rawLines,
          {
            start: { line, column },
          },
          {
            highlightCode: true,
            ...codeFrame,
          }
        ),
      ].join('\n\n');
    } else {
      return message;
    }
  } else {
    return message;
  }
}
