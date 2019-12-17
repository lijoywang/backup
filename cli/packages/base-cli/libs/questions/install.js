// 插件选择
module.exports = {
  name: 'plugins',
  description: '插件类型选择',
  type: 'list',
  choices: [
    { name: 'Eslint', value: 'eslint' },
    { name: 'Babel', value: 'babel' },
    { name: 'Commit Lint', value: 'commitLint' },
    { name: 'Multiple', value: 'multiple' }
  ]
};