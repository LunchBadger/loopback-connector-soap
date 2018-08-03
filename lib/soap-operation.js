// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: soap-operation

'use strict';

module.exports = SoapOperation;

/**
* @constructor
* SoapOperation constructor
* @param {String} service
* @param {String} port
* @param {String} method
* @returns {SoapOperation}
*/
function SoapOperation(service, port, method) {
  this.service = service;
  this.port = port;
  this.method = method;
}

/**
* Equality test for usage as keys in a Map
*/
SoapOperation.prototype.equals = function(obj) {
    return (obj instanceof SoapOperation) &&
        (obj.service === this.service) &&
        (obj.port === this.port) &&
        (obj.method === this.method);
};

SoapOperation.prototype.toString = function() {
  return this.service + ":" + this.port + ":" + this.method;
}
