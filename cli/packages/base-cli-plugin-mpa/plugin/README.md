# multi-html-webpack-plugin

### 插件功能

基于 html-webpack-plugin 插件，根据多入口 rule 规则输出多页面，支持所有 html-webpack-plugin 参数

### 扩展参数

- rule [Regexp] 通配符匹配，符合多入口打包，默认\*\*/main.js
- context [String] 业务目录，默认 src/pages
- filename [String] 重写 filename 为 handlebars 模板, 默认{{foldername}}/index.html
- activeChunks [Function] 根据 entry,返回不同 chunks
- proxy [Array] mockApi 代理，支持正则

### 使用说明

```
const MfwMultiHtmlWebpackPlugin = require('@mfw/multi-html-webpack-plugin');

new MfwMultiHtmlWebpackPlugin({
  rule: '**/main.js',
  filename: '{{foldername}}/index.html',
  context: 'src/pages',
  activeChunks(entry) {
    if (entry.match('src/pages/year_end_inventory')) {
      return ['commons'];
    }
  }

  /**所有 html-webpack-plugin 配置**/
})
```
