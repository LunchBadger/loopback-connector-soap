// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: lunchbadger-connector-soap

'use strict';

var soap = require('soap');
var Connector = require('loopback-connector').Connector;
var SoapDAO = require('./soap-dao');
var SoapModel = require('./soap-model');
var SoapOperation = require('./soap-operation');
var debug = require('debug')('lunchbadger:connector:soap');
var SoapRequest = require('./soap-request');

// Mandatory method to be exported
// (required by LoopBack Framework)
exports.initialize = initDataSource;

/**
 * Method to retrieve DataSource properties and create a
 * Connector instance. Also associate the connector instance
 * with the DataSource
 * @param {DataSource} dataSource The data source object
 * @param callback
 */
function initDataSource(dataSource, callback) {

  if (!dataSource) {
    debug('initDataSource: undefined dataSource object');

    return;
  }

  var settings = dataSource.settings || {};
  var connector = new LunchBadgerSOAPConnector(settings);

  dataSource.connector = connector;
  dataSource.connector.dataSource = dataSource;

  process.nextTick( function() {
    callback && connector.connect(callback);
  });

}

exports.LunchBadgerSOAPConnector = LunchBadgerSOAPConnector;

/**
* @constructor
* LunchBadgerSOAPConnector constructor
* Sets connector configurattion (particularly WSDL) from
* DataSource object. Initializes models and DAO.
*
* The datasourceProps JSON object may contain a modelConfig
* field to supply options required to define a model object,
* and a clientConfig field to supply options required to
* define a SOAP client object.
*
* @param {Object} dataSourceProps The connector properties
* @returns {LunchBadgerSOAPonnector}
*/
function LunchBadgerSOAPConnector(dataSourceProps) {

  var connectorProps = dataSourceProps || {};
  console.log("connectorProps = " + JSON.stringify(connectorProps));
  var soapEndPoint = connectorProps.endpoint || connectorProps.url;
  var wsdl = connectorProps.wsdl || (soapEndPoint + '?wsdl');
  var name = connectorProps.name

  if (!soapEndPoint) {
    debug('LunchBadgerSOAPConnector constructor: soapEndPoint undefined');
    return;
  } else {
    const soapURL = parseURL(soapEndPoint);
    var protocol = soapURL.protocol;
    if (!soapURL) {
      debug('LunchBadgerSOAPConnector constructor: invalid soapEndPoint');
      return;
    } else {
      // file:/// URL may be supported for testing purposes
      if (!(protocol === 'http:' || protocol === 'https:' ||
                                        protocol === 'file:')) {
        debug(
        'LunchBadgerSOAPConnector constructor: invalid soapEndPoint protocol %s',
                                                                      protocol);
        return;
      }

      connectorProps.host = soapURL.hostname;
      connectorProps.port = soapURL.port;
      connectorProps.protocol = soapURL.protocol;

    }
  }

  if (!wsdl) {
    debug('LunchBadgerSOAPConnector constructor: wsdl undefined');
    return;
  } else {
    const wsdlURL = parseURL(wsdl);
    if (!wsdlURL) {
      debug('LunchBadgerSOAPConnector constructor: invalid wsdl');
      return;
    } else {
      connectorProps.wsdl = wsdl;
    }
  }

  debug('LunchBadgerSOAPConnector constructor: name = %s, ' +
          'soapEndPoint = %s, wsdl = %s', name, soapEndPoint, wsdl);

  // Save the connector properties
  this.connectorProps = connectorProps;
  debug('LunchBadgerSOAPConnector constructor: connectorProps = %s',
                                  JSON.stringify(this.connectorProps));

  // initialize models object
  var modelConfig = connectorProps.modelConfig || {};
  var modelName = modelConfig.modelName || 'soap-model';
  var modelProps = modelConfig.modelProps || {};
  var modelOpts = modelConfig.modelOpts || {};
  this._models = new SoapModel(modelName, modelProps, modelOpts);
  //initialize DAO
  this.DataAccessObject = new SoapDAO();

}

/**
* Creates a SOAP Client and associates it with this Connector instance
* Introspects the WSDL and populates the DataSource with available
* SOAP operations
*/
LunchBadgerSOAPConnector.prototype.connect = function(callback) {

  var soapClient = this.soapClient;
  if (soapClient) {
    debug('LunchBadgerSOAPConnector connect: already connected');
    process.nextTick(function () {
      callback && callback(null, soapClient);
    });
    return;
  }

  var wsdl = this.connectorProps.wsdl;
  var clientConfig = this.connectorProps.clientConfig || {};

  // TO DO :
  // Extract client security credentials from clientConfig object

  var self = this;
  soap.createClient(wsdl, clientConfig, function(err, client) {
    if (err) {
      debug('LunchBadgerSOAPConnector connect: failed to create SOAP client: %s',
                                                      err.message);
      return;
    }

    // Save the SOAP client object
    self.soapClient = client;
    client.soapConnector = self;

    // Populate the DAO with SOAP operations
    var opsJson = client.describe();
    self.createMethodBindings(opsJson);

    // Invoke the callback Method
    process.nextTick(function () {
      callback && callback(err, client);
    });

  });

}

// Inheriting from LoopBack Connector object, which implements basic
// interfaces for maintaining models, getting id, property name, etc.
require('util').inherits(LunchBadgerSOAPConnector, Connector);

/**
 * Get types associated with the connector
 * @returns {String[]} The types for the connector
 */
LunchBadgerSOAPConnector.prototype.getTypes = function() {
  return ['lunchbadgersoap'];
};

const { URL } = require('url');

/**
* Util method to parse a URL and check that the URL is valid
* @returns {URL} A Url object from which host, port, protocol etc. can be found
*/
function parseURL(url) {

  try {
    return new URL(url)
  } catch (e)  {
    if (e instanceof TypeError) {
      debug('LunchBadgerSOAPConnector parseRL: invalid URL %s', url);
    } else {
      debug('LunchBadgerSOAPConnector parseRL: unexpected erro %s', e.message);
    }
    return null;
  }

}

/**
* Takes a JSON structure returned by SOAP client describe() function
* and creates method bindings on the current soap client object
* Example JSON structure:
*   {
*     MyService: {
*        MyPort: {
*          MyOperation: {
*            input: {
*              name: 'string'
*            }
*          }
*        }
*      }
*    }
*
* @param {Object} opsJson JSON containing services, ports, operations
* @private
*/
LunchBadgerSOAPConnector.prototype.createMethodBindings = function(operations) {

  var opsCount = this.DataAccessObject.listOperations().length;
  if (opsCount > 0) {
    debug('LunchBadgerSOAPConnector methodBindings already created');
    return;
  }

  // TO DO : some SOAP operations may have 'bindings'
  for (var svc in operations) {
    debug('LunchBadgerSOAPConnector service : %s', svc);
    var ports = operations[svc];
    for (var port in ports) {
      debug('LunchBadgerSOAPConnector port : %s', port);
        var ops = ports[port];
        for (var op in ops) {
          debug('LunchBadgerSOAPConnector operation : %s', op);
          var soapOp = new SoapOperation(svc, port, op);

          var soapMethod = this.soapClient[svc][port][op];
          var soapInvoke = soapMethod.bind(this.soapClient);

          this.DataAccessObject.addOperation(soapOp, soapInvoke);

        }
    }

  }

};
