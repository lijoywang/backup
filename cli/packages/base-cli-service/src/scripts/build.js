import yParser from 'yargs-parser';

process.env.NODE_ENV = 'production';

const args = yParser(process.argv.slice(2));
const Service = require('../Service').default;
new Service(process.env.CLI_CONTEXT || process.cwd()).run('build', args);
