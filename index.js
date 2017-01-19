#!/usr/bin/env node
require('dotenv').config();

var cli = require('commander');

require('./ctrl/osm')(cli);

cli.parse(process.argv);
