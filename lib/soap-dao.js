// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: soap-dao

'use strict';

module.exports = SoapDAO

/**
* @constructor
* SoapDAO constructor
* @returns {SoapDAO}
*/
function SoapDAO() {
  var ops = this._operations;
  if (!ops)
    this._operations = new Map();
}

/**
* Add / replace a soap operation to the internal lookup table
* @param {SoapOperation} op
* @param soapMethod
*/
SoapDAO.prototype.addOperation = function(op, soapMethod) {
  this._operations.set(op, soapMethod);
}

/**
* Find a soap operation from the internal lookup table
* @param {SoapOperation} op
* @returns soapMethod
*/
SoapDAO.prototype.findOperation = function(op) {
  var svc = op.service;
  var port = op.port;
  var method = op.method;

  for (var [key, value] of this._operations) {
    var thissvc = key.service;
    var thisport = key.port;
    var thismethod = key.method;

    if (thissvc === svc && thisport === port && thismethod === method)
    return value;
  }
  return null;
  //this._operations.get(op); -- TO DO : this shoudl work with Map()
}

/**
* List all soap operations from the internal lookup table
* Can be used for introspecting the WSDL
* @returns {SoapOperation} array
*/
SoapDAO.prototype.listOperations = function() {
  var ops = [];
  for (var [key, value] of this._operations) {
    ops.push(key);
  }
  return ops;
}
