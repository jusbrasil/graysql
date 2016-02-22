'use strict';

const graphql = require('graphql');
const expect = require('chai').expect;

const SimpleType = require('../../support/types/simple');


module.exports = function (parseQuery) {

  describe('@parseQuery', function () {

    describe('#constructor(rawQuery)', function () {
      it('should only accept a POJO as parameter', function () {
        expect(() => parseQuery('asdfad', {}, {})).to.throw(TypeError, /GraysQL Error/);
        expect(() => parseQuery(x => x, {}, {})).to.throw(TypeError, /GraysQL Error/);
        expect(() => parseQuery({}, {}, {})).to.not.throw(TypeError, /GraysQL Error/);
      });
    });

    describe('#generate(types)', function () {
      let Simple;
      let query;

      let increaseOnParseQueryArg = 1;
      function onGenerateArg() {
        increaseOnParseQueryArg += 1;
      }

      let increaseOnGenerateQuery = 1;
      function onGenerateQuery() {
        increaseOnGenerateQuery += 1;
      }

      const listeners = {
        onGenerateArg: [onGenerateArg],
        onGenerateQuery: [onGenerateQuery]
      };

      before(function () {
        Simple = new graphql.GraphQLObjectType({
          name: 'Simple',
          fields: () => ({
            id: { type: graphql.GraphQLInt }
          })
        });

        query = SimpleType().queries.simple;
      });

      it('should call onGenerateArg listeners', function () {
        parseQuery(query, { Simple }, listeners);
        expect(increaseOnParseQueryArg).to.be.above(1);
      });

      it('should call onGenerateQuery listeners', function () {
        expect(increaseOnGenerateQuery).to.be.above(1);
      });

      it('should replace all the types in the query with valid GraphQL types', function () {
        expect(parseQuery(query, { Simple }, {}).type).to.equal(Simple);
      });

      it('should generate non nullable arguments', function () {
        const expectedQuery = {
          type: Simple,
          args: {
            id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
          },
          resolve: (_, args) => { id: 1 }
        };
        const testQuery = parseQuery({
          type: 'Simple',
          args: {
            id: { type: 'Int!' }
          },
          resolve: (_, args) => { id: 1 }
        }, { Simple }, {});
        expect(JSON.stringify(testQuery)).to.equal(JSON.stringify(expectedQuery));
      });

      it('should generate a valid query', function () {
        const manQuery = {
          type: Simple,
          args: {
            id: { type: graphql.GraphQLInt }
          },
          resolve: (_, args) => { id: 1 }
        };
        expect(JSON.stringify(parseQuery(query, { Simple }, {}))).to.equal(JSON.stringify(manQuery));
      });

    });
  });

};
