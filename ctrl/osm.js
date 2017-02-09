const fs = require('fs');
const osm = require('../src/osm');

module.exports = (cli) => {
  function osmQuery(query, opts) {

    var osmPromise = osm.request(query).then(osm.parse);

    if (opts.save) {
      console.log(opts.save);
      osmPromise = osmPromise.then(osm.save);
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
    .action(osmQuery);

  /**
   * Query to OSM using overpassql file
   */
  cli.command('osm:queryfile <filepath>')
    .description('Update dataset by querying to OpenStreetMap using overpassql file')
    .option('--save', 'Save to database')
    .action((filepath, opts) => {
      fs.readFile(process.cwd()+'/'+filepath, (err, query) => {
        return osmQuery(query, opts);
      });
    });
};
