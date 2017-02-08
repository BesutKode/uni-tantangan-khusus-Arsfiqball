const request = require('request');
const db = require('../src/db');
const DataCredit = require('../src/db').DataCreditModel;

module.exports = (cli) => {
  var states = {
    save: false,
    lang: 'en'
  };

  function find(titles, opts) {
    (() => {
      return new Promise((resolve, reject) => {
        var url = "https://"+states.lang+".wikipedia.org/w/api.php?action=query&format=json&prop=contributors&titles="+titles;

        request(url, (err, res, body) => {
          if (err) {
            return reject(new Error('Request failed.'));
          }

          return resolve(JSON.parse(body));
        });
      });
    })().then((wikiObj) => {
      return new Promise((resolve, reject) => {
        if (!states.save) {
          return resolve(wikiObj);
        }

        db.connect();

        var ids = wikiObj.continue.pccontinue.split('|');
        var id = ids[0];

        for (var i = 0; i < wikiObj.query.pages[id].contributors.length; i++) {
          if (wikiObj.query.pages[id].contributors[i].name) {
            DataCredit.update({
              origin: 'wikipedia',
              id: states.lang+'/'+id,
              name: wikiObj.query.pages[id].contributors[i].name
            }, {
              origin: 'wikipedia',
              id: states.lang+'/'+id,
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
    }).then((wikiObj) => {
      return new Promise((resolve, reject) => {
        var ids = wikiObj.continue.pccontinue.split('|');
        var id = ids[0];
        var names = [];
        var x = 0;

        for (var i = 0; i < wikiObj.query.pages[id].contributors.length; i++) {
          if (wikiObj.query.pages[id].contributors[i].name) {
            names[x] = wikiObj.query.pages[id].contributors[i].name;
            x++;
          }
        }

        console.log(JSON.stringify(names, null, "  "));
      });
    });
  }

  /**
   * Find wikipedia data by title
   */
  cli.command('wikipedia:title <title>')
    .description('Find wikipedia data by title')
    .option('--save', 'Save to database', () => {
      states.save = true;
    })
    .option('--lang <lang>', 'Use wiki for specific language', (lang) => {
      states.lang = lang;
    })
    .action(find);
};
