// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: soapop-test

'use strict';

/**
 * Setting up a unit test env.
 * TO DO: Add many many more unit tests
 */

var should = require('should');

var SoapOperation = require('../lib/soap-operation');

describe('Soap Operation Object Equality', function () {

  it('should determine object equality correctly', function (done) {

    var soapOp1 = new SoapOperation("OrteLookup", "OrteLookupSoap",
                                              "GetPrefixedEntries");

    var soapOp2 = new SoapOperation("OrteLookup", "OrteLookupSoap",
                                              "GetPrefixedEntries");

    should.deepEqual(soapOp1, soapOp2);

    done();

  });

  it('should determine object inequality correctly', function (done) {

    var soapOp1 = new SoapOperation("IncorrectServiceName", "OrteLookupSoap",
                                              "GetPrefixedEntries");

    var soapOp2 = new SoapOperation("OrteLookup", "OrteLookupSoap",
                                              "GetPrefixedEntries");

    should.notDeepEqual(soapOp1, soapOp2);

    done();

  });

});
