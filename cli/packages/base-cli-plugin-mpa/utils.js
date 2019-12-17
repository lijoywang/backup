const { join, dirname } = require('path');
const { existsSync } = require('fs');
const glob = require('glob');
const { isPlainObject } = require('lodash');

exports.getEntry = (opts) => {
  const isDev = process.env.NODE_ENV === 'development';
  const { pages, cwd } = opts;
  const defaultPagesConfig = {
    root: 'src/pages',
    page: '',
    file: '**/main.*s',
  };

  const { root, page, file, exclude } = Object.assign(
    defaultPagesConfig,
    pages
  );

  let entries = {};
  let files = [];
  // 支持多入口启动 eg: NODE_PACKAGE='activity_qList, dt_destination'
  if (page.indexOf(',') > -1) {
    page
      .replace(/\s/g, '')
      .split(',')
      .forEach((item) => {
        files = files.concat(glob.sync(join(cwd, root, item, file)));
      });
  } else {
    files = glob.sync(join(cwd, root, page, file));
  }

  files.forEach((entry, index) => {
    // eg: /Users/wanglijun/project/activity/src/pages/reserve_note/pages/main.js
    // result: reserve_note/pages
    const foldername = dirname(
      entry.replace(join(cwd, root), '').replace(/^\//gi, '')
    );

    if (!(exclude && foldername.match(exclude))) {
      entries[foldername] = entry;
    }
  });
  return entries;
};
