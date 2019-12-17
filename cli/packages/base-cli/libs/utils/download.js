// download gitlab
const download = require('download-git-repo');

const GITLATB_URL = 'https://gitlab.mfwdev.com:mbasebiz/fe-cli-templates#master'; // 仓库地址

module.exports = async (cwd) => {
  return await new Promise((resolve) => {
    download(
      GITLATB_URL,
      cwd,
      { clone: true },
      (error) => {
        resolve(error);
      }
    );
  });
};