'use strict';

const graphql = require('graphql');
const expect = require('chai').expect;

const DB = require('../../support/db');
const SimpleType = require('../../support/types/simple');
const TestUser = require('../../support/types/user');
const TestGroup = require('../../support/types/group');


module.exports = function (parseType) {

  describe('@parseType', function () {
    describe('#constructor(rawType)', function () {
      it('should only accept a POJO as parameter', function () {
        expect(() => parseType('adsfa', {}, {})).to.throw(TypeError, /GraysQL Error: Expected rawType to be an object/);
        expect(() => parseType(x => x, {}, {})).to.throw(TypeError, /GraysQL Error: Expected rawType to be an object/);
        expect(() => parseType({}, {}, {})).to.not.throw(TypeError, /GraysQL Error: Expected rawType to be an object/);
      });
    });

    describe('#parseType(types, interfaces)', function () {
      let User;
      let Group;
      let types;
      let finalTypes;

      let increaseOnParseTypeField = 1;
      function onGenerateField() {
        increaseOnParseTypeField += 1;
      }

      let increaseOnGenerateType = 1;
      function onGenerateType() {
        increaseOnGenerateType += 1;
      }

      const listeners = {
        onGenerateField: [onGenerateField],
        onGenerateType: [onGenerateType]
      };

      before(function () {
        User = new graphql.GraphQLObjectType({
          name: 'User',
          fields: () => ({
            id: { type: graphql.GraphQLInt },
            nick: { type: graphql.GraphQLString },
            group: { type: Group }
          })
        });
        Group = new graphql.GraphQLObjectType({
          name: 'Group',
          fields: () => ({
            id: { type: graphql.GraphQLInt },
            name: { type: graphql.GraphQLString },
            members: { type: new graphql.GraphQLList(User) }
          })
        });

        types = {
          User: TestUser({ options: { DB } }),
          Group: TestGroup({ options: { DB } }),
        };

        finalTypes = {  };
        finalTypes['User'] = parseType(types['User'], finalTypes, listeners);
        finalTypes['Group'] = parseType(types['Group'], finalTypes, {});
      });

      it('should call onParseparseTypeField listeners', function () {
        parseType(types['User'], finalTypes, listeners)._typeConfig.fields();
        expect(increaseOnParseTypeField).to.be.above(1);
      });

      it('should call onGenerateType listeners', function () {
        expect(increaseOnGenerateType).to.be.above(1);
      });

      it('should generate a valid GraphQLObjectType', function () {
        expect(finalTypes['User']).to.include.keys(Object.keys(User));
        expect(finalTypes['User']._typeConfig.fields()).to.include.keys(Object.keys(User._typeConfig.fields()));
      });

      it('should link to other GraphQLObjectTypes if specified', function () {
        expect(finalTypes['User']._typeConfig.fields().group.type).to.equal(finalTypes['Group']);
        expect(JSON.stringify(finalTypes['Group']._typeConfig.fields().members.type)).to.equal(JSON.stringify(new graphql.GraphQLList(finalTypes['User'])));
      });
    });
  });

};
