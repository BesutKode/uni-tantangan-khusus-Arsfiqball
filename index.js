#!/usr/bin/env node
require('dotenv').config();

var cli = require('commander');

require('./ctrl/osm')(cli);
require('./ctrl/wikipedia')(cli);

cli.parse(process.argv);
