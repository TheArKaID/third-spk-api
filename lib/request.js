'use strict';

const config = require('./../config');
const db = require('./db')();
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = (req, res, next) => {
	req.getConfig = function () {
		return config;
	}

	req.getPath = function () {
		const url = req.url;
		const splittedUrl = url.split('/');
		// remove "/api" string
		splittedUrl.shift();
		splittedUrl.shift();
		splittedUrl.shift();
		return splittedUrl.join('/');
	}

	req.getApiKey = function () {
		return req.headers['api-key'];
	}

	req.getApplicationName = function () {
		return config['API_KEYS'][req.getApiKey()];
	}

	req.getToken = function () {
		return req.headers.authorization;
	}

	req.getUser = function () {
		return req._user;
	}

	req.fetchUser = function (userId) {
		return db('vSysUser')
			.select(
				'userId',
				'userCode',
				'employeeCode',
				'fullName'
			)
			.where('userId', userId)
			.first()
	}

	req.initUser = function (user) {
		req._user = {
			userId: user.userId,
			userCode: user.userCode,
			employeeCode: user.employeeCode,
			fullName: user.fullName
		}
	}

	req.setUser = function (user) {
		// req._user = user;
		req._user = {
			userId: user.uid,
			userCode: user.ucd,
			employeeCode: user.emp,
			fullName: user.fnm,
			audience: user.aud,
			menus: user.mns
		};
	}

	req.getData = function () {
		return req._data;
	}

	req.setData = function (data) {
		req._data = data;
	}

	req.isAuth = function () {
		if (!req.getToken() || !req.verifyToken()) {
			return false;
		}

		return req.getUser() ? true : false;
	}

	req.getOrigin = function () {
		return req.hostname;
	}

	req.getIpAddress = function () {
		let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		if (ipAddress.substr(0, 7) == "::ffff:") {
			ipAddress = ipAddress.substr(7);
		}
		return ipAddress;
	}

	req.verifyToken = function (secret, subject = 'token') {
		const publicKey = fs.readFileSync('./jwtRSA256-public.pem');
		const token = req.getToken();

		// secret = secret || config.SECRET;
		try {
			if (secret) {
				const data = jwt.verify(token, secret, {
					subject: subject
				})

				// TODO : Check data.audience
				if (subject === 'token') {
					req.setUser(data);
				} else {
					req.setData(data);
				}
				return true;
			} else {
				const data = jwt.verify(token, publicKey, {
					algorithm: 'RS256',
					subject: subject
				})

				// TODO : Check data.audience
				if (subject === 'token') {
					req.setUser(data);
				} else {
					req.setData(data);
				}
				return true;
			}

		} catch (error) {
			console.error('Invalid Token', error);
			return false;
		}
	}

	req.getApiUrl = function () {
		let protocol = 'https';
		const host = req.get('host');
		if (host !== 'training.paramount-land.com' && host !== 'training-dev.paramount-land.com' &&
			host !== 'insight.paramount-land.com' && host !== 'insight-dev.paramount-land.com'
		) {
			protocol = 'http';
		}
		const apiUrl = protocol + '://' + host + '/api/v2/training/'

		return apiUrl;
	}

	next();
}