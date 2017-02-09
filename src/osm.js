const request = require('request');
const db = require('../src/db');
const DataCredit = require('../src/db').DataCreditModel;

function log(err, data) {
  //
}

exports.request = (query) => {
  return new Promise((resolve, reject) => {
    var url = encodeURI('http://overpass-api.de/api/interpreter?data='+query);

    request(url, (err, res, body) => {
      if (err) {
        return reject(new Error('Request failed.'));
      }

      return resolve(body);
    });
  });
};

exports.parse = (body) => {
  return new Promise((resolve, reject) => {
    var osmdata;

    try {
      osmdata = JSON.parse(body);
    } catch (e) {
      return reject(new Error("JSON can not be parsed. Are you sure your query is correct? you missed to put \"[out:json]\" ?"));
    }

    if (!osmdata.elements) {
      return reject(new Error("This request result null elements. Are you sure you have put \"out meta;\" on last line?"));
    }

    resolve(osmdata);
  });
};

exports.save = (osmdata) => {
  return new Promise((resolve, reject) => {
    db.connect();

    for (var i = 0; i < osmdata.elements.length; i++) {
      if (osmdata.elements[i].user) {
        DataCredit.update({
          origin: 'osm',
          id: osmdata.elements[i].type+'/'+osmdata.elements[i].id
        }, {
          id: osmdata.elements[i].type+'/'+osmdata.elements[i].id,
          origin: 'osm',
          name: osmdata.elements[i].user,
          timestamp: osmdata.elements[i].timestamp
        }, {
          upsert: true
        }, log);
      }
    }

    db.disconnect();

    return resolve(osmdata);
  });
};

exports.getNames = (osmdata) => {
  return new Promise((resolve, reject) => {
    var names = {};

    if (!osmdata.elements) {
      return reject(new Error("This request result null elements. Are you sure you have put \"out meta;\" on last line?"));
    }

    for (var i = 0; i < osmdata.elements.length; i++) {
      if (!names[osmdata.elements[i].user]) {
        names[osmdata.elements[i].user] = 0;
      }
      names[osmdata.elements[i].user] += 1;
    }

    return resolve(names);
  });
};
