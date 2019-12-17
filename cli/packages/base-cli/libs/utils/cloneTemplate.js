const globby = require('globby');
const path = require('path');
const fs = require('fs-extra');
const ejs = require('ejs');
const write = require('./write');
const download = require('./download');
const { customPlugins } = require('../config');

function fileterAnswers(answers) {
  const plginsKeys = Object.keys(customPlugins);
  const pluginVals = Object.values(customPlugins);

  answers.plugins = answers.plugins.map((plugin) => {
    const index = pluginVals.indexOf(plugin);
    if (index !== -1) {
      return plginsKeys[index];
    }
    return plugin;
  });

  return answers;
}

// clone template
class Tempalte {
  constructor(context, answers, folderName) {
    this.context = context;
    this.answers = fileterAnswers(answers);
    this.folderName = folderName;
    this.cwd = path.join(__dirname, '../../tmp');

    this.answers['folderName'] = this.folderName;
    // 输出资源地址
    this.output = { };
  }

  async removeTmp() {
    if (fs.existsSync(this.cwd)) {
      await fs.remove(this.cwd);
    }
  }

  async download() {
    await this.removeTmp();
    return await download(this.cwd);
  }

  readFileSync(file) {
    return ejs.render(
      fs.readFileSync(file, 'utf-8'),
      this.answers
    );
  }

  isFile(cwd) {
    try {
      fs.ensureFileSync(cwd)
      return true;
    } catch (err) {
      return false;
    }
  }

  readAllFileSync(folder, done) {
    const cwd = path.join(this.cwd, folder);
    if (this.isFile(cwd)) {
      if (done) {
        done.call(this, this.readFileSync(cwd), folder, 'root');
      }
    } else {
      const resources = globby.sync('**' , { cwd });
      if (resources) {
        resources.forEach(resource => {
          const file = path.join(cwd, resource);
          if (done) {
            done.call(this, this.readFileSync(file), resource, folder);
          }
        });
      }
    }
  }

  appendOutput(content, resource, folder) {
    let prefix = `src/pages/${this.folderName}`;
    if (folder === 'static') {
      prefix = 'static';
    } else if (folder === 'root') {
      prefix = '';
    } else {
      if (!this.answers.plugins.includes('multiple')) {
        prefix = 'src';
      }
    }

    this.output[path.join(
      prefix,
      resource
    )] = content;
  }

  async write() {
    await this.removeTmp();
    await write(this.context, this.output);
  }

  async render(templates) {
    const isError = await this.download();
    if (isError) {
      console.log('模版下载失败，请重新下载！');
    }

    templates.forEach(
      template => this.readAllFileSync(template, this.appendOutput)
    );

    this.write();
  }
};

module.exports = {
  async init(context, answers, folderName = 'demo') {
    answers['vueMode'] =  false;

    const instance = new Tempalte(context, answers, folderName);
    let templates = [ 'static', '.gitignore' ];
    if (answers.framework === 'vue') {
      templates.push('templates/vue');
      if (answers.isRouter) {
        templates.push('templates/vue-router');
      }
    }

    await instance.render(templates);
  },
  async add(context, answers, folderName) {
    const templates = [];
    if (answers.framework == 'vue') {
      templates.push('templates/vue');
      if (answers.isRouter) {
        templates.push('templates/vue-router');
      }
    } else {
      templates.push(answers.framework);
    }

    // 判断多入口是否存在
    const multiple = 'multiple';
    if (!answers.plugins.includes(customPlugins['multiple'])) {
      const { install } = await require('../plugin')(multiple);
      if (install) {
        await install();
      }
    }

    answers['vueMode'] = false;
    const instance = new Tempalte(context, answers, folderName);
    await instance.render(templates);
  }
};
