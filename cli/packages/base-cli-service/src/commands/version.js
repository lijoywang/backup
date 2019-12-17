export default api => {
  api.registerCommand('version',
    {
      description: 'show related versions',
    }, args => {
      const pkg = require('../../package.json');
      if (args.verbose) {
        const versions = api.applyPlugins('addVersionInfo', {
          initialValue: [
            `${process.platform} ${process.arch}`,
            `node@${process.version}`,
            `base-cli-service@${pkg.version}`,
          ],
        });
        versions.forEach(version => {
          console.log(version);
        });
      } else {
        console.log(pkg.version);
      }
    })
}