const fs = require('fs');
const osm = require('../src/osm');
const async = require('async');
const wikipedia = require('../src/wikipedia');

module.exports = (cli) => {
  function osmQuery(query, opts) {

    var osmPromise = osm.request(query).then(osm.parse);

    if (opts.save) {
      osmPromise = osmPromise.then(osm.save);
    }

    if (opts.wikipedia) {
      osmPromise = osmPromise.then((osmdata) => {
        return new Promise((resolve, reject) => {
          var q = async.queue((task, done) => {
            wikipedia
              .request(task.title, task.lang)
              .then(wikipedia.save(task.lang))
              .then(() => {
                done();
              });
          }, 1);

          q.drain = () => {};

          var keys;
          for (var i = 0; i < osmdata.elements.length; i++) {
            if (osmdata.elements[i].tags && osmdata.elements[i].tags.wikipedia) {
              keys = osmdata.elements[i].tags.wikipedia.split(':');
              q.push({ title: keys[1], lang: keys[0] });
            }
          }

          resolve(osmdata);
        });
      });
    }

    osmPromise
      .then(osm.getNames)
      .then((names) => {
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
    .option('--save', 'Save to database')
    .option('--wikipedia', 'Find connected wikipedia contributors')
    .action(osmQuery);

  /**
   * Query to OSM using overpassql file
   */
  cli.command('osm:queryfile <filepath>')
    .description('Update dataset by querying to OpenStreetMap using overpassql file')
    .option('--save', 'Save to database')
    .option('--wikipedia', 'Find connected wikipedia contributors')
    .action((filepath, opts) => {
      fs.readFile(process.cwd()+'/'+filepath, (err, query) => {
        return osmQuery(query, opts);
      });
    });
};
