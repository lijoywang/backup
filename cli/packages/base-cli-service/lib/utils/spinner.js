"use strict";

const ora = require('ora');

const chalk = require('chalk');

const spinner = ora();
let lastMsg = null;
/**
 * server loading...
 * 
 * @param {*} symbol
 * @param {*} msg
 */

exports.logWithSpinner = (symbol, msg) => {
  if (!msg) {
    msg = symbol;
    symbol = chalk.green('✔');
  }

  if (lastMsg) {
    spinner.stopAndPersist({
      symbol: lastMsg.symbol,
      text: lastMsg.text
    });
  }

  spinner.text = ' ' + msg;
  lastMsg = {
    symbol: symbol + ' ',
    text: msg
  };
  spinner.start();
};
/**
 * stop loading
 *
 * @param {*} persist
 */


exports.stopSpinner = persist => {
  if (lastMsg && persist !== false) {
    spinner.stopAndPersist({
      symbol: lastMsg.symbol,
      text: lastMsg.text
    });
  } else {
    spinner.stop();
  }

  lastMsg = null;
};

exports.pauseSpinner = () => {
  spinner.stop();
};

exports.resumeSpinner = () => {
  spinner.start();
};