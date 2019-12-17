// css 预处理器
module.exports = {
  name: 'cssPreprocessors',
  description: '选择一个Css预处理器',
  type: 'list',
  when: anwser => anwser.plugins.includes('css-preprocessors'),
  choices: anwsers => [
    { name: 'Sass/SCSS', value: 'sass' },
    { name: 'Less', value: 'less' },
    { name: 'Stylus', value: 'stylus' }
  ]
};