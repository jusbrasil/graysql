'use strict';

const graphql = require('graphql');
const expect = require('chai').expect;

module.exports = function(parseUnion) {
  describe('@parseUnion', function() {
    describe('#constructor(rawUnion)', function() {
      it('should only accept a POJO as parameter', function () {
          expect(() => parseUnion('adsfa', {}, {})).to.throw(TypeError, /GraysQL Error: Expected rawUnion to be an object/);
          expect(() => parseUnion(x => x, {}, {})).to.throw(TypeError, /GraysQL Error: Expected rawUnion to be an object/);
          expect(() => parseUnion({ types: ['String'] }, {}, {})).to.not.throw(TypeError, /GraysQL Error: Expected rawUnion to be an object/);
      });
    });

    describe('#types(union)', function() {
      it('should throw error if types field is not an array', function () {
        expect(() => parseUnion({ types: 'SomeType' }, {}, {})).to.throw(TypeError, /GraysQL Error: Expected union types to be an array, got string instead/);
        expect(() => parseUnion({}, {}, {})).to.throw(TypeError, /GraysQL Error: Expected union types to be an array, got undefined instead/);
      });
    });

    describe('#generator(union)', function() {
      const union = {
        name: 'SimpleUnion',
        types: [ 'Simple' ],
        resolveType: function () { return 'Simple'; }
      };

      let Simple, SimpleUnion;
      let increaseOnParseUnionArg = 1;
      function onGenerateUnion() {
        increaseOnParseUnionArg += 1;
      }

      const listeners = {
        onGenerateUnion: [onGenerateUnion]
      };

      before(function () {
        Simple = new graphql.GraphQLObjectType({
          name: 'Simple',
          fields: () =>({
            id: { type: graphql.GraphQLInt }
          })
        });
        SimpleUnion = parseUnion(union, { Simple }, listeners);
      });

      it('should call onGenerateUnion listeners', function () {
        expect(increaseOnParseUnionArg).to.be.above(1);
      });

      it('should return a graphql union type', function () {
        expect(SimpleUnion instanceof graphql.GraphQLUnionType).true;
      });

      it('should reference Simple type', function () {
        expect(SimpleUnion._typeConfig.types.length).eq(1);
        expect(SimpleUnion._typeConfig.types[0]).equals(Simple);
      });

      it('should resolve type to Simple', function () {
        expect(SimpleUnion.resolveType()).equals(Simple);
      });
    });
  });
};