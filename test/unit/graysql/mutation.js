'use strict';

const graphql = require('graphql');
const expect = require('chai').expect;

const SimpleType = require('../../support/types/simple');


module.exports = function (parseMutation) {

  describe('@Mutation', function () {
    describe('#constructor', function () {
      it('should only accept a POJO as parameter', function () {
        expect(() => parseMutation('asdfad', {}, {})).to.throw(TypeError, /GraysQL Error: Expected rawMutation to be an object/);
        expect(() => parseMutation(x => x, {}, {})).to.throw(TypeError, /GraysQL Error: Expected rawMutation to be an object/);
        expect(() => parseMutation({}, {}, {})).to.not.throw(TypeError, /GraysQL Error: Expected rawMutation to be an object/);
      });
    });
    describe('#generate(types)', function () {
      let simpleMutation;
      let mutation;
      let Simple;

      let incrementOnParseMutationArg = 1;
      function onGenerateArg() {
        incrementOnParseMutationArg += 1;
      }

      let incrementOnGenerateMutation = 1;
      function onGenerateMutation() {
        incrementOnGenerateMutation += 1;
      }

      const listeners = {
        onGenerateArg: [onGenerateArg],
        onGenerateMutation: [onGenerateMutation]
      };

      before(function () {
        simpleMutation = SimpleType().mutations.createSimple;
        Simple = new graphql.GraphQLObjectType({
          name: 'Simple',
          fields: () =>({
            id: { type: graphql.GraphQLInt }
          })
        });
      });

      beforeEach(function () {
        mutation = simpleMutation;
      });

      it('should call onGenerateArg listeners', function () {
        parseMutation(mutation, { Simple }, listeners);
        expect(incrementOnParseMutationArg).to.be.above(1);
      });

      it('should call onGenerateMutation listeners', function () {
        expect(incrementOnGenerateMutation).to.be.above(1);
      });

      it('should replace all the types in the mutation with valid GraphQL types', function () {
        expect(parseMutation(mutation, { Simple }, listeners).type).to.equal(Simple);
      });

      it('should generate non nullable arguments', function () {
        const expectedMutation = {
          type: Simple,
          args: {
            id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
          },
          resolve: () => ({ id: 1 })
        };
        const testMutation = parseMutation({
          type: 'Simple',
          args: {
            id: { type: 'Int!' }
          },
          resolve: () => ({ id: 1 })
        }, { Simple }, listeners);
        expect(JSON.stringify(testMutation)).to.equal(JSON.stringify(expectedMutation));
      });

      it('should generate a valid mutation', function () {
        const manMutation = {
          type: Simple,
          args: {
            id: { type: graphql.GraphQLInt }
          },
          resolve: () => ({ id: 1 })
        };
        expect(JSON.stringify(parseMutation(mutation, { Simple }, listeners))).to.equal(JSON.stringify(manMutation));
      });
    });
  });

};
