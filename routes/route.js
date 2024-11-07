'use strict';

const route = require('express')();
route.use('/', require('./index'));

module.exports = route;