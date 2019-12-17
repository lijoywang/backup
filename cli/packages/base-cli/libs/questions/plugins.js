// 插件选择
module.exports = {
  name: 'plugins',
  description: '插件类型选择',
  type: 'checkbox',
  default: [ 'eslint', 'babel', 'multiple', 'micro' ],
  choices: anwsers => [
    { name: 'Eslint', value: 'eslint' },
    { name: 'Babel', value: 'babel' },
    { name: 'Commit Lint', value: 'commitLint' },
    { name: 'CSS Pre-processors', value: 'css-preprocessors' },
    { name: 'Multiple', value: 'multiple' },
    { name: 'MicroService', value: 'micro' }
  ]
};