'use strict';

const graphql = require('graphql');
const Utils = require('../utils');


function parseUnion(rawUnion, types, listeners) {
  if(typeof rawUnion !== 'object' || Array.isArray(rawUnion)) {
    throw new TypeError(`GraysQL Error: Expected rawUnion to be an object, got ${typeof rawUnion} instead`);
  }

  if (typeof rawUnion.types !== 'object' || !Array.isArray(rawUnion.types)) {
    throw new TypeError(`GraysQL Error: Expected union types to be an array, got ${typeof rawUnion.types} instead`);
  }

  const preparePayload = (union) => ({ union, types });
  const union = Utils.applyListeners(
        rawUnion,
        listeners.onGenerateUnion,
        preparePayload
    );

  const finalUnion = Object.assign({}, union, {
    types: union.types.map(union => types[union]),
    resolveType: (value, info) => {
      const typeRef = rawUnion.resolveType(value, info);
      return typeRef && types[typeRef];
    }
  });

  return new graphql.GraphQLUnionType(finalUnion);
}

module.exports = parseUnion;