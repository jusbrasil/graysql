'use strict';

const Utils = require('../utils');
const parseArgs = require('./arg');

function parseMutation(rawMutation, types, listeners) {
  if (typeof rawMutation !== 'object' || Array.isArray(rawMutation)) {
    throw new TypeError(`GraysQL Error: Expected rawMutation to be an object, got ${typeof rawMutation} instead`);
  }

  const preparePayload = (mutation) => ({ mutation, types });
  const mutation = Utils.applyListeners(
    rawMutation,
    listeners.onGenerateMutation,
    preparePayload
  );

  return Object.assign({}, mutation, {
    type: Utils.parseType(mutation.type, types),
    args: mutation.args && parseArgs(mutation.args, types, listeners)
  });
}

module.exports = parseMutation;
