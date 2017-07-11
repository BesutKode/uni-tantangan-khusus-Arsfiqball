import fs from 'fs';
import path from 'path';
import test from 'ava';
import osmSrc from '../src/osm';

const filename = 'kalimantan.osm-q.txt';
const resultFilename = 'kalimantan_contributors.json';
var query;
var data;
var obj;
var names;

test.before(t => {
  query = fs.readFileSync(__dirname +'/'+ filename);
  data = fs.readFileSync(__dirname +'/kalimantan.osm.json');
});

test.serial('can parse json', async t => {
  try {
    obj = await osmSrc.parse(data);
  } catch (e) {
    t.fail(e);
  }

  t.pass();
});

test.serial('return json format { ?name: ?count }', async t => {
  names = await osmSrc.getNames(obj);

  Object.keys(names).map(function(name) {
    if (! typeof(names[name]) == 'number') {
      t.fail();
    }
  });

  t.pass();
});

test.serial('name list verified', async t => {
  var counted = {};

  Object.keys(names).map(function(name) {
    counted[name] = 0;
  });

  obj.elements.map(function(element) {
    if (names[element.user]) {
      counted[element.user] += 1;
    }
  });

  t.deepEqual(names, counted);
});
