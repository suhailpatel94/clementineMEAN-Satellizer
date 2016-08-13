'use strict';

var path = process.cwd();

var LoginHandler = require(path + '/app/controllers/LoginHandler.server.js');

var config = require('../config/configgit.js');

module.exports = function (app) {

    var loginHandler = new LoginHandler();

    app.route('/auth/github').post(loginHandler.gitLogin);

    app.route('/api/me').get(loginHandler.ensureAuthenticated, loginHandler.getUserProfile);

};