// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: soap-model

'use strict';

var loopback = require('loopback');
var debug = require('debug')('lunchbadger:soap-model');

module.exports = SoapModel;

/**
* @constructor
* LunchBadger SoapModel constructor
* Composed of a model object that extends LoopBack Model class
* @param {Object} dataSourceProps The connector properties
* @returns {SoapModel}
*/
function SoapModel(name, properties, options) {
  debug('Creating Soap Model: name = %s, ', name);
  this._model = loopback.Model.extend(name, properties, options);
}

/**
* Register a remote method (REST API)
*/
SoapModel.prototype.addRemoteMethod = function(name, options) {
  return this._model.remoteMethod(name, options);
}

/**
* De-register a remote method (REST API)
*/
SoapModel.prototype.disableRemoteMethod = function(name) {
  return this._model.disableRemoteMethodByName(name);
}
