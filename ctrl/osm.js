const request = require('request');
const fs = require('fs');
const db = require('../src/db');
const DataCredit = require('../src/db').DataCreditModel;

module.exports = (cli) => {
  var states = {
    save: false
  };

  function osmQuery(query, opts) {
    (() => {
      // Make Request to OpenStreetMap Server
      return new Promise((resolve, reject) => {
        var url = encodeURI('http://overpass-api.de/api/interpreter?data='+query);

        request(url, (err, res, body) => {
          if (err) {
            return reject(new Error('Request failed.'));
          }

          return resolve(body);
        });
      })
    })().then((body) => {
      // Parsing OSM Data
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
    }).then((osmdata) => {
      // Saving DataCredits
      return new Promise((resolve, reject) => {
        if (!states.save) {
          return resolve(osmdata);
        }

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
            }, (err) => {
              if (err) { console.log(err); }
            });
          }
        }

        db.disconnect();

        return resolve(osmdata);
      });
    }).then((osmdata) => {
      // Get Names
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
    }).then((names) => {
      return console.log(JSON.stringify(names, null, "  "));
    }).catch((err) => {
      return console.log(err);
    });
  }

  /**
   * Query to OSM
   */
  cli.command('osm:query <query>')
    .description('Update dataset by querying to OpenStreetMap')
    .option('--save', 'Save to database', () => {
      states.save = true;
    })
    .action(osmQuery);

  /**
   * Query to OSM using overpassql file
   */
  cli.command('osm:queryfile <filepath>')
    .description('Update dataset by querying to OpenStreetMap using overpassql file')
    .option('--save', 'Save to database', () => {
      states.save = true;
    })
    .action((filepath, opts) => {
      fs.readFile(process.cwd()+'/'+filepath, (err, query) => {
        return osmQuery(query, opts);
      });
    });
};
