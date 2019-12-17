import yParser from 'yargs-parser';

let closed = false;

// kill(2) Ctrl-C
process.once('SIGINT', () => onSignal('SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', () => onSignal('SIGQUIT'));
// kill(15) default
process.once('SIGTERM', () => onSignal('SIGTERM'));

function onSignal(signal) {
  if (closed) return;
  closed = true;
  process.exit(0);
}

process.env.NODE_ENV = 'development';

const args = yParser(process.argv.slice(2));
const Service = require('../Service').default;
new Service(process.env.CLI_CONTEXT || process.cwd())
  .run('dev', args)
  .catch((err) => {
    error(err);
    process.exit(1);
  });
