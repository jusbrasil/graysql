'use strict';

const graphql = require('graphql');
const parseFields = require('./field');
const Utils = require('../utils');


function parseInterface(rawInterface, types, listeners) {
  if (typeof rawInterface !== 'object' || Array.isArray(rawInterface)) {
    throw new TypeError(`GraysQL Error: Expected rawInterface to be an object, got ${typeof rawInterface} instead`);
  }

  const preparePayload = (iface) => ({ iface, types });
  let iface = Utils.applyListeners(
    rawInterface,
    listeners.onGenerateInterface,
    preparePayload
  );

  const fields = iface.fields;
  iface = Object.assign({}, iface, {
    fields: () => parseFields(fields, iface, types, listeners)
  });

  return new graphql.GraphQLInterfaceType(iface);
}

module.exports = parseInterface;
