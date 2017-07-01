const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const expect = require('chai').expect;
const osmSrc = require('../src/osm');

describe('OpenStreetMap', function() {

  const filename = 'kalimantan.osm-q.txt';
  const resultFilename = 'kalimantan_contributors.json';
  var query;
  var data;
  var obj;
  var names;

  before(function() {
    query = fs.readFileSync(__dirname +'/' + filename);
    data = fs.readFileSync(__dirname +'/kalimantan.osm.json');
  });

  describe('Source Processor', function() {

    it('can parse json', function() {
      return osmSrc.parse(data).then((objData) => {
        obj = objData;
        expect(objData).to.be.an('object');
      });
    });

    it('object result is equal to overpass-api has', function() {
      const body = JSON.parse(fs.readFileSync(__dirname + '/kalimantan.osm.json'));
      expect(body.elements).to.deep.equal(obj.elements);
    });

    it('return json format { ?name: ?count }', function() {
      return osmSrc.getNames(obj).then((nameList) => {
        names = nameList;
        Object.keys(nameList).map(function(i) {
          expect(i).to.be.a('string');
          expect(nameList[i]).to.be.a('number');
        });
      });
    });

    it('name list verified', function() {
      this.timeout(60*1000);
      const nameArray = Object.keys(names);

      obj.elements.map(function(element) {
        expect(element.user).to.be.oneOf(nameArray);
      });
    });
  });

  describe('Data', function() {

    if (fs.existsSync(path.resolve(__dirname, '../results/', resultFilename))) {
      it('user contributions do not decrease', function() {
        const existingData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../results/', resultFilename)));

        com = spawn('node ../index.js', ['osm:queryfile', filename]);
        com.stdout.on('data', (names) => {
          newData = JSON.parse(names.toString());
          Object.keys(newData).map(function(name) {
            if (existingData[name]) {
              expect(newData[name]).to.be.least(existingData[name]);
            }
          });
        });
      });
    }
  });
});
