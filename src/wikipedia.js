const request = require('request');
const db = require('../src/db');
const DataCredit = require('../src/db').DataCreditModel;

exports.request = (title, lang) => {
  return new Promise((resolve, reject) => {
    var url = "https://"+lang+".wikipedia.org/w/api.php?action=query&format=json&prop=contributors&titles="+title;

    request(url, (err, res, body) => {
      if (err) {
        return reject(new Error('Request failed.'));
      }

      return resolve(JSON.parse(body), lang);
    });
  });
};

exports.save = (wikiObj, lang) => {
  return new Promise((resolve, reject) => {

    db.connect();

    var ids = wikiObj.continue.pccontinue.split('|');
    var id = ids[0];

    for (var i = 0; i < wikiObj.query.pages[id].contributors.length; i++) {
      if (wikiObj.query.pages[id].contributors[i].name) {
        DataCredit.update({
          origin: 'wikipedia',
          id: lang+'/'+id,
          name: wikiObj.query.pages[id].contributors[i].name
        }, {
          origin: 'wikipedia',
          id: lang+'/'+id,
          name: wikiObj.query.pages[id].contributors[i].name
        }, {
          upsert: true
        }, (err) => {
          if (err) { console.log(err); }
        });
      }
    }

    db.disconnect();

    return resolve(wikiObj);
  });
};

exports.print = (wikiObj) => {
  return new Promise((resolve, reject) => {
    var ids = wikiObj.continue.pccontinue.split('|');
    var id = ids[0];
    var names = [];
 
    for (var i = 0; i < wikiObj.query.pages[id].contributors.length; i++) {
      if (wikiObj.query.pages[id].contributors[i].name) {
        names.push(wikiObj.query.pages[id].contributors[i].name);
      }
    }

    console.log(JSON.stringify(names, null, "  "));

    resolve(wikiObj);
  });
};
