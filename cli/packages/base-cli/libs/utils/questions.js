
const inquirer = require('inquirer');

class Answers {
  constructor(
    files = [
      '../questions/framework',
      '../questions/plugins',
      '../questions/cssPreprocessors',
      '../questions/vue'
    ]
  ) {
    this.files = files;

    this.prompts = [];
    this.promptOns = [];

    this.files.forEach(file => {
      let prompts;

      if (typeof file === 'string') {
        prompts = require(file);
      } else {
        prompts = file;
      }
      // const prompts = require(file);
      if (prompts) {
        if (Array.isArray(prompts)) {
          this.prompts = this.prompts.concat(prompts);
        } else {
          this.prompts.push(prompts);
        }
      }
    });
  }

  async apply(preset) {
    let _preset = {...preset};
    const result = await inquirer.prompt(this.prompts);
    
    if (result) {
      return {..._preset, ...result};
    }
    return {..._preset};
  }
}

module.exports = (preset, files) => {
  const answers = new Answers(files);

  return answers.apply(preset);
};
