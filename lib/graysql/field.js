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
  let field = Utils.applyListeners(
    rawField,
    listeners.onGenerateField,
    preparePayload
  );

  field = Object.assign({}, field, {
    type: Utils.parseType(field.type, types),
    args: parseArgs(field.args, types, listeners)
  });

  return field;
}

module.exports = parseFields;
