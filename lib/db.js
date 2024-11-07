'use strict'

const config = require('./../config');
const db = require('knex');

module.exports = function (database) {

	database = database || 'default';

	const databases = config.DB;
	const selectedDatabase = databases[database];

	const dbConfig = {
		client: selectedDatabase.client,
		connection: {
			host: selectedDatabase.host,
			user: selectedDatabase.user,
			password: selectedDatabase.password,
			database: selectedDatabase.database,
			requestTimeout: 600000,
			connectionTimeout: 20000,
			options: {
				encrypt: false,
				enableArithAbort: true
			}
		},

	}

	return db(dbConfig);
}