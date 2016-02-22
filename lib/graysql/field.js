'use strict';

const parseArgs = require('./arg');
const Utils = require('../utils');


function parseFields(rawFields, ownerType, types, listeners) {
  const fields = {};
  for (const key in (rawFields || {})) {
    fields[key] = parseField(key, rawFields[key], ownerType, types, listeners);
  }
  return fields;
}

function parseField(key, rawField, ownerType, types, listeners) {
  const preparePayload = (field) => ({ key, field, types, type: ownerType });
  const field = Utils.applyListeners(
    rawField,
    listeners.onGenerateField,
    preparePayload
  );

  return Object.assign({}, field, {
    type: Utils.parseType(field.type, types),
    args: field.args && parseArgs(field.args, types, listeners)
  });
}

module.exports = parseFields;
