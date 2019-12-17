const MfwFeMonitorConfigPlugin = require('@mfw/fe-monitor-config-plugin');
const utils = require('../utils');

const createFeMonitorConfigPlugin = (options = {}) => {
  let entrys = utils.createEntry(options, true);
  const projectNameList = [];
  const entryMatchList = [];
  Object.keys(entrys).forEach((key) => {
    const name = utils.name2key.getName(key);
    projectNameList.push(name + '.activity.mshequ');
    entryMatchList.push(new RegExp(name + '/index.html', 'g'));
  });

  return new MfwFeMonitorConfigPlugin({
    entryMatch: entryMatchList,
    projectName: projectNameList
  });
};



module.exports = createFeMonitorConfigPlugin;
