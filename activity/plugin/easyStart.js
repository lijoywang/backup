const inquirer = require('inquirer')
const exec = require('child_process').execSync

const webpackConf = require('../webpack.base.config.js')
const { name2key } = require('../utils')
const czScopes = require('../../.cz-config.js').scopes
const nameMap = {}
const keyMap = {}
czScopes.map((item) => {
  if (item.page) {
    nameMap[item.page] = item.name
    keyMap[item.name] = item.page
  }
})
const allEntries = Object.keys(webpackConf.entry).map(
  (item) => nameMap[name2key.getName(item)] || name2key.getName(item),
)

function startWithEntries(entries) {
  const package = entries.join(',')
  exec(`NODE_PACKAGE='${package}' npm run dev`, { stdio: 'inherit' }, function(
    error,
    stdout,
    stderr,
  ) {
    if (stdout.length > 1) {
      console.log('you offer args:', stdout)
    } else {
      console.log("you don't offer args")
    }
    if (error) {
      console.info('stderr : ' + stderr)
    }
  })
}

;(async function choiceEntry() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'entry',
      message: '选择启动入口',
      choices: allEntries,
    },
  ])
  if (!answers.entry.length) {
    console.log('')
    console.log(`入口必须选一个呀！`)
    console.log('')
    choiceEntry()
  } else {
    let entries = answers.entry.map((item) => keyMap[item] || item)
    console.log(entries)
    startWithEntries(entries)
  }
})()
