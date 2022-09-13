'use strict';

const graphql = require('graphql');
const Utils = require('../utils');


function parseUnion(rawUnion, types, listeners) {
    if(typeof rawUnion !== 'object' || Array.isArray(rawUnion)) {
        throw new TypeError(`GraysQL Error: Expected rawUnion to be an object, got ${typeof rawUnion} instead`);
    }

    const preparePayload = (union) => ({ union, types });
    const union = Utils.applyListeners(
        rawUnion,
        listeners.onGenerateUnion,
        preparePayload
    );

    return new graphql.GraphQLUnionType(union);
}

module.exports = parseUnion;