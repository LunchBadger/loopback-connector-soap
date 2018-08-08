// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: soapinvoke-test

'use strict';

/**
 * Setting up a unit test env.
 * TO DO: Add many many more unit tests
 */

var should = require('should');
var assert = require('assert');
var debug = require('debug')('lunchbadger:soap:invokeOperation');

var LunchBadgerSOAPConnector = require('../lib/lunchbadger-soap-connector').LunchBadgerSOAPConnector;
var SoapRequest = require('../lib/soap-request');

describe('Soap Operation Invocation', function () {

    it('should invoke a SOAP operation and obtain expected response', function(done) {

        var dataSource = {
            "settings" : {
                "url" : "http://mathertel.de/AJAXEngine/S02_AJAXCoreSamples/OrteLookup.asmx",
                "name" : "soapDS"
            }
        };

        var settings = dataSource.settings || {};
        var connector = new LunchBadgerSOAPConnector(settings);

        dataSource.connector = connector;
        dataSource.connector.dataSource = dataSource;

        connector.connect(function(err, callback) {

            if (err) {
                debug("Could not connect to SOAP endpoint: " + err);
                return;
            }

            var soapreq = new SoapRequest(connector);
            var reqXml =
                "<GetPrefixedEntries xmlns=\"http://www.mathertel.de/OrteLookup/\">" +
                    "<prefix>Ber</prefix>" +
                "</GetPrefixedEntries>";

            soapreq.buildRequest(reqXml, true, {}, {});
            soapreq.invoke("OrteLookup", "OrteLookupSoap12", "GetPrefixedEntries", function(err, result, raw, soapheader) {

                if (err) {
                    debug("SOAP Request Error: " + err);
                    return;
                }

                assert.notEqual(connector.soapClient.lastResponseHeaders['content-length'], 0);
                assert.deepEqual(connector.soapClient.lastResponseHeaders['content-type'], 'text/xml; charset=utf-8');
                assert.notEqual(connector.soapClient.lastResponse.indexOf('Berg'), -1);
                assert.notEqual(connector.soapClient.lastResponse.indexOf('Beratzhausen'), -1);

                done();

            });  // end soapreq.invoke   

        }); // end connector.connect(...)

    }); // end it

}); // end describe
