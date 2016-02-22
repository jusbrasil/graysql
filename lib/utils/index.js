'use strict';

const TypeParser = require('./type-parser');


module.exports = {

  parseType: TypeParser.parseType,

  bindAll(listeners, thisArg) {
    return listeners.map(l => l.bind(thisArg));
  },

  applyListeners(initalValue, listeners, preparePayload) {
    listeners = listeners || [];
    return listeners.reduce(
      (v, listener) => Object.assign({}, v, listener(preparePayload(v))),
      initalValue
    );
  }

};
