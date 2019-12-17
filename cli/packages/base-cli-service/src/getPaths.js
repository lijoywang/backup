import { join } from 'path';
import { existsSync, statSync } from 'fs';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export default function(service) {
  const { cwd, config } = service;
  const outputPath = config.outputPath || './public';
  let pagesPath = 'pages';
  if (test(join(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }

  const absPagesPath = join(cwd, pagesPath);
  const absSrcPath = join(absPagesPath, '../');

  return {
    cwd,
    outputPath,
    absOutputPath: join(cwd, outputPath),
    absPagesPath,
    absSrcPath,
  };
}
