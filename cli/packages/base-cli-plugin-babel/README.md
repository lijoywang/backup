# @mfw/base-cli-plugin-babel

> base-cli 的 babel 插件

## 配置

默认使用 Babel 7 + `babel-loader` + @mfw/babel-preset-app，但可通过 `babel.config.js` 或 `.babelrc` 配置使用任何其它 Babel 预设选项或插件。

默认情况下，`babel-loader` 会排除 `node_modules` 依赖内部的文件。
