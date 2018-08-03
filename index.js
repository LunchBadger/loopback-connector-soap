// Copyright LunchBadger. 2018. All Rights Reserved.
// Node module: lunchbadger-connector-soap

// module.exports = require('./lib/lunchbadger-soap-connector');

console.log("Running application");

var datasource = {
  "settings" : {
    "url" : "http://mathertel.de/AJAXEngine/S02_AJAXCoreSamples/OrteLookup.asmx",
    "name" : "soapDS"
  }
};

var opt = process.argv[2];
if (!opt) {
  console.log("Usage: DEBUG=* node index.js initds | invokereq");
  process.exit();
}

if (opt === 'initds') {
  var soapinit = require('./lib/lunchbadger-soap-connector').initialize;

  soapinit(datasource, function(err, result) {
    console.log("soapinit callback");
  });

}

if (opt === 'invokereq') {
  var soapreq = require('./lib/lunchbadger-soap-connector').testinvoke;

  soapreq(datasource);
}
