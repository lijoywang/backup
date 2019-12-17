module.exports = {
  plugins: ['prettier'],
  extends: [
    'eslint:recommended',
    require.resolve('eslint-config-prettier'),
    require.resolve('eslint-config-prettier/vue'),
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'warn',
    'prettier/prettier': 'warn',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true
      }
    ],
    // 关闭禁用不必要的转义
    'no-useless-escape': 0,
    // 关掉必须每声明一个变量使用一个变量符号
    'one-var': 0,
    // 关闭 promise 必须命名参数为 resolve reject
    'promise/param-names': 0,
    // allow paren-less arrow functions 要求箭头函数的参数使用圆括号
    'arrow-parens': 0,
    // allow async-await 强制 generator 函数中 * 号周围使用一致的空格
    'generator-star-spacing': 0,
    semi: ['error', 'always'],
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    quotes: ['error', 'single'],
    'arrow-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    'no-useless-return': 0,
    eqeqeq: 0,
    //  关闭Error 对象或 null 作为回调的第一个参数
    'handle-callback-err': 0,
    'no-return-await': 0,
  },
};
