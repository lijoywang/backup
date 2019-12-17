const prompts = (module.exports = [
  {
    name: `classComponent`,
    type: `confirm`,
    message: `Use class-style component syntax?`,
    default: true,
  },
  {
    name: `useTsWithBabel`,
    type: `confirm`,
    message: `Use Babel alongside TypeScript for auto-detected polyfills?`,
  },
  {
    name: `lint`,
    type: `confirm`,
    message: `Use TSLint?`,
  },
  {
    name: `lintOn`,
    type: `checkbox`,
    when: (answers) => answers.lint,
    message: `Pick lint features:`,
    choices: [
      {
        name: 'Lint on save',
        value: 'save',
        checked: true,
      },
    ],
  },
]);

module.exports.getPrompts = (pkg) => {
  prompts[2].when = () =>
    !('@vue/cli-plugin-eslint' in (pkg.devDependencies || {}));
  return prompts;
};
