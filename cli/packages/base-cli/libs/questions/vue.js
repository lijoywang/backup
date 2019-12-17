// css 预处理器
module.exports = [
  {
    name: 'isRouter',
    message: '是否选择vue-router?',
    type: 'confirm',
    when: anwser => anwser.framework.includes('vue')
  },
  {
    name: 'isHistory',
    message: 'mode history?',
    type: 'confirm',
    when: anwser => anwser.isRouter
  },
];