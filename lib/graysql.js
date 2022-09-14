'use strict';

const graphql = require('graphql');

const parseInterface = require('./graysql/interface');
const parseType = require('./graysql/type');
const parseMutation = require('./graysql/mutation');
const parseQuery = require('./graysql/query');
const parseUnion = require('./graysql/union');


class GraysQL {

  constructor(options) {
    if (options && typeof options !== 'object') {
      throw new TypeError(`GraysQL Error: Expected options to be an object, got ${typeof options} instead`);
    }

    // Initialize private state
    this._listeners = {
      onGenerateArg: [],
      onGenerateField: [],
      onGenerateInterface: [],
      onGenerateMutation: [],
      onGenerateType: [],
      onGenerateQuery: [],
      onGenerateUnion: []
    };

    this._finalTypes = {};
    this._types = {};
    this._interfaces = {};
    this._queries = {};
    this._mutations = {};
    this._unions = {};

    // Initialize public state
    this.options = Object.assign({}, options);
  }

  use(extension) {
    if (typeof extension !== 'function') {
      throw new TypeError(`GraysQL Error: Expected extension to be a function, got ${typeof extension} instead`);
    }

    extension = extension(this);

    // Call onInit method of extension
    if (extension.onInit) {
      extension.onInit.bind(this)();
      delete extension.onInit;
    }

    // Mount the extension
    for (const key in extension) {
      if ( ! this._listeners[key] && ! key.startsWith('_')) {
        GraysQL.prototype[key] = extension[key];
      }

      else if (this._listeners[key]) {
        this._listeners[key].push(extension[key].bind(this));
      }
    }
  }

  registerScalar(scalar, overwrite) {
    if (this._finalTypes[scalar.name] && ! overwrite) {
      throw new Error(`GraysQL Error: Scalar ${scalar.name} is already registered`);
    }

    this._finalTypes[scalar.name] = scalar;
  }

  registerType(type, overwrite) {
    if (type instanceof graphql.GraphQLObjectType) {
      return this._finalTypes[type.name] = type;
    }

    if (typeof type !== 'function') {
      throw new TypeError(`GraysQL Error: Expected type to be a function, got ${typeof type} instead`);
    }

    const typeObj = type(this);

    if (this._types[typeObj.name] && ! overwrite) {
      throw new Error(`GraysQL Error: Type ${typeObj.name} is already registered`);
    }

    this.addQueries(typeObj.queries, overwrite);
    this.addMutations(typeObj.mutations, overwrite);

    this._types[typeObj.name] = typeObj;

    return typeObj;
  }

  registerUnion(union, overwrite) {
    if (union instanceof graphql.GraphQLUnionType) {
      return this._finalTypes[union.name] = union;
    }

    if (typeof union !== 'function') {
      throw new TypeError(`GraysQL Error: Expected union to be a function, got ${typeof union} instead`);
    }

    const unionObj = union(this);

    if (this._unions[unionObj.name] && ! overwrite) {
      throw new Error(`GraysQL Error: Union ${unionObj.name} is already registered`);
    }

    this.addQueries(union.queries, overwrite);
    this.addMutations(union.mutations, overwrite);

    this._unions[unionObj.name] = unionObj;

    return unionObj;
  }

  registerInterface(iface, overwrite) {
    if (iface instanceof graphql.GraphQLInterfaceType) {
      return this._finalTypes[iface.name] = iface;
    }

    if (typeof iface !== 'function') {
      throw new TypeError(`GraysQL Error: Expected interface to be a function, got ${typeof type} instead`);
    }

    const ifaceObj = iface(this);

    if (this._interfaces[ifaceObj.name] && ! overwrite) {
      throw new Error(`GraysQL Error: Interface ${ifaceObj.name} is already registered`);
    }

    this.addMutations(ifaceObj.mutations, overwrite);

    this._interfaces[ifaceObj.name] = ifaceObj;

    return ifaceObj;
  }

  addQueries(queries, overwrite) {
    // Add type queries
    for (const queryName in queries) {
      let query;
      if (typeof queries[queryName] === 'function') {
        query = queries[queryName];
      }
      else {
        query = () => queries[queryName];
      }
      this.addQuery(queryName, query, overwrite);
    }
  }

  addMutations(mutations, overwrite) {
    // Add type mutations
    for (const mutationName in mutations) {
      let mutation;
      if (typeof mutations[mutationName] === 'function') {
        mutation = mutations[mutationName];
      }
      else {
        mutation = () => mutations[mutationName];
      }
      this.addMutation(mutationName, mutation, overwrite);
    }
  }

  addQuery(name, query, overwrite) {
    if (typeof query !== 'function') {
      throw new TypeError(`GraysQL Error: Expected query to be a function, got ${typeof query} instead`);
    }

    if ( ! name) {
      throw new Error(`GraysQL Error: Missing query name`);
    }

    const queryObj = query(this);

    if (this._queries[name] && ! overwrite) {
      throw new Error(`GraysQL Error: Query ${name} is already added`);
    }

    this._queries[name] = queryObj;

    return queryObj;
  }

  addMutation(name, mutation, overwrite) {
    if (typeof mutation !== 'function') {
      throw new TypeError(`GraysQL Error: Expected mutation to be a function, got ${typeof mutation} instead`);
    }

    if ( ! name) {
      throw new Error(`GraysQL Error: Missing mutation name`);
    }

    const mutationObj = mutation(this);

    if (this._mutations[name] && ! overwrite) {
      throw new Error(`GraysQL Error: Mutation ${name} is already added`);
    }

    this._mutations[name] = mutationObj;

    return mutationObj;
  }

  generateSchema() {
    this._generateTypes(this._interfaces, parseInterface);
    this._generateTypes(this._types, parseType);
    this._generateTypes(this._unions, parseUnion);
    const Query = this._generateQuery();
    const Mutation = this._generateMutation();

    const schemaDef = {};
    if (Query) {
      schemaDef['query'] = Query;
    }
    if (Mutation) {
      schemaDef['mutation'] = Mutation;
    }

    return new graphql.GraphQLSchema(schemaDef);
  }

  _generateTypes(items, parseFn) {
    for (const key in items) {
      this._finalTypes[key] = parseFn(items[key], this._finalTypes, this._listeners);
    }
  }

  _generateQuery() {
    const finalQueries = {};
    for (const key in this._queries) {
      finalQueries[key] = parseQuery(key, this._queries[key], this._finalTypes, this._listeners);
    }

    return Object.keys(finalQueries).length > 0 ? new graphql.GraphQLObjectType({
      name: 'Query',
      fields: finalQueries
    }) : null;
  }

  _generateMutation() {
    const finalMutations = {};
    for (const key in this._mutations) {
      finalMutations[key] = parseMutation(this._mutations[key], this._finalTypes, this._listeners);
    }

    return Object.keys(finalMutations).length > 0 ? new graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: finalMutations
    }) : null;
  }

}


module.exports = GraysQL;
