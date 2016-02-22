'use strict';

const graphql = require('graphql');
const parseFields = require('./field');
const Utils = require('../utils');


function parseType(rawType, types, listeners) {
  if (typeof rawType !== 'object' || Array.isArray(rawType)) {
    throw new TypeError(`GraysQL Error: Expected rawType to be an object, got ${typeof rawType} instead`);
  }

  const preparePayload = (type) => ({ type, types });
  const type = Utils.applyListeners(
    rawType,
    listeners.onGenerateType,
    preparePayload
  );

  const finalType = Object.assign({}, type, {
    interfaces: mapInterfaces(type.interfaces, types),
    fields: () => parseFields(type.fields, finalType, types, listeners)
  });

  return new graphql.GraphQLObjectType(finalType);
}

function mapInterfaces(interfaces, types) {
  return interfaces ? interfaces.map(iface => types[iface]) : [];
}

module.exports = parseType;
