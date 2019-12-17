# @mfw/babel-preset-app

BASE CLI 项目默认的 Babel 预设选项。

## 包含的内容

- [@babel/preset-env](https://new.babeljs.io/docs/en/next/babel-preset-env.html)
  - [`useBuiltIns: 'usage'`](#usebuiltins)
    - 确保 polyfill 会按需导入
- 默认包含 `Promsie` polyfill，这样它们也可以用于非转译依赖

## 选项

### targets

- 默认值：
  - 当为浏览器构建时，由 `.browserslistrc` 文件决定

### useBuiltIns

- 默认值：`'usage'`

默认值是 `'usage'`，它会基于被转译代码的使用情况导入相应的 polyfill。例如，你在代码里使用了 `Object.assign`，那么如果你的目标环境不支持它，对应的 polyfill 就会被自动导入。

### polyfills

- 默认值：`['es6.promise']`
