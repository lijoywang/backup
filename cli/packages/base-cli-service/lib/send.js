"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = send;
exports.RESTART = exports.STARTING = exports.DONE = void 0;

const debug = require('debug')('service:send');

const DONE = 'DONE';
exports.DONE = DONE;
const STARTING = 'STARTING';
exports.STARTING = STARTING;
const RESTART = 'RESTART';
exports.RESTART = RESTART;

function send(message) {
  if (process.send) {
    debug(`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}