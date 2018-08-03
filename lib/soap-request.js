// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: soap-request

'use strict';

var soap = require('soap');
var SoapOperation = require('./soap-operation');

module.exports = SoapRequest;

/**
* @constructor
* SoapRequest constructor
*
* @param {LunchBadgerSOAPConnector} connector
* @returns {SoapRequest}
*/
function SoapRequest(connector) {
  this.connector = connector
  this.requestParams = {};
}

/**
* Prepare a SOAP Request. Should be called before
* actually invoking the SOAP Request
* Prepares the parameters for node-soap client invocation
*/
SoapRequest.prototype.buildRequest = function(payload, isXML,
                                                options, xtraheaders) {
  this.requestParams = {}; // reset the request object

  if (isXML) {
    var payloadStr = payload || {};
    this.requestParams.payload = {};
    this.requestParams.payload._xml = payloadStr;
  } else {
    this.requestParams.payload = payload || {};
  }

  this.requestParams.options = options || {};
  this.requestParams.xtraheaders = xtraheaders || {};

}

/**
* Invoke a SOAP Request. Should be called after calling buildRequest
* callback is expected to be in the format: function(error, result)
*/
SoapRequest.prototype.invoke = function(service, port, operation, callback) {

  var client = this.connector.soapClient;
  var dao = this.connector.DataAccessObject;
  var op = new SoapOperation(service, port, operation);
  var fn = dao.findOperation(op);

  fn.call(client, this.requestParams.payload, this.requestParams.options,
                  this.requestParams.xtraheaders, callback);

}

// TO DO :
// More invoke functions with optional xml transformers and
// custom response deserializers.
