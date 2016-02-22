'use strict';

const Utils = require('../utils');


function parseArgs(rawArgs, types, listeners) {
  const args = {};
  for (const key in (rawArgs || {})) {
    args[key] = parseArg(key, rawArgs[key], types, listeners);
  }
  return args;
}

function parseArg(key, rawArg, types, listeners) {
  const preparePayload = (arg) => ({ key, arg, types });
  const arg = Utils.applyListeners(
    rawArg,
    listeners.onGenerateArg,
    preparePayload
  );

  return Object.assign({}, arg, {
    type: Utils.parseType(arg.type, types)
  });
}

module.exports = parseArgs;
