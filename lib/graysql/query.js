'use strict';

const Utils = require('../utils');
const parseArgs = require('./arg');


function parseQuery(key, rawQuery, types, listeners) {
  if (typeof rawQuery !== 'object' || Array.isArray(rawQuery)) {
    throw new TypeError(`GraysQL Error: Expected rawQuery to be an object, got ${typeof rawQuery} instead`);
  }

  const preparePayload = (query) => ({ key, query, types });
  const query = Utils.applyListeners(
    rawQuery,
    listeners.onGenerateQuery,
    preparePayload
  );

  return Object.assign({}, query, {
    type: Utils.parseType(query.type, types),
    args: query.args && parseArgs(query.args, types, listeners)
  });
}

module.exports = parseQuery;
