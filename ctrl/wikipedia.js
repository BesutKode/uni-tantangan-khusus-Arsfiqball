const wikipedia = require('../src/wikipedia');

module.exports = (cli) => {

  function find(title, opts) {
    var wikiPromise = wikipedia.request(title, opts.lang);

    if (opts.save) {
      wikiPromise = wikiPromise.then(wikipedia.save);
    }

    wikiPromise
      .then(wikipedia.print)
      .catch((err) => {
        console.log('Error: '+err);
      });
  }

  /**
   * Find wikipedia data by title
   */
  cli.command('wikipedia:title <title>')
    .description('Find wikipedia data by title')
    .option('--save', 'Save to database')
    .option('--lang <lang>', 'Use wiki for specific language')
    .action(find);
};
