'use strict';

var Usergs = require('../models/usergs.js');
var config = require('../config/configgit.js');
var request = require('request');
var qs = require('querystring');
var moment = require('moment');
var jwt = require('jwt-simple');

function LoginHandler() {

    this.ensureAuthenticated = function (req, res, next) {
        if (!req.header('Authorization')) {
            return res.status(401).send({
                message: 'Please make sure your request has an Authorization header'
            });
        }
        var token = req.header('Authorization').split(' ')[1];

        var payload = null;
        try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
        } catch (err) {
            return res.status(401).send({
                message: err.message
            });
        }

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'Token has expired'
            });
        }
        req.user = payload.sub;
        next();
    }



    this.getUserProfile = function (req, res) {
        Usergs.findById(req.user, function (err, user) {
            res.json(user.github.name);
        });
    }


    this.gitLogin = function (req, res) {

        var accessTokenUrl = 'https://github.com/login/oauth/access_token';
        var userApiUrl = 'https://api.github.com/user';
        var params = {
            code: req.body.code
            , client_id: req.body.clientId
            , client_secret: config.GITHUB_SECRET
            , redirect_uri: req.body.redirectUri
        };

        // Step 1. Exchange authorization code for access token.
        request.get({
            url: accessTokenUrl
            , qs: params
        }, function (err, response, accessToken) {
            accessToken = qs.parse(accessToken);
            var headers = {
                'User-Agent': 'Satellizer'
            };

            // Step 2. Retrieve profile information about the current user.
            request.get({
                url: userApiUrl
                , qs: accessToken
                , headers: headers
                , json: true
            }, function (err, response, profile) {

                // Step 3a. Link user accounts.
                if (req.header('Authorization')) {
                    Usergs.findOne({
                        'github.id': profile.id
                    }, function (err, existingUser) {
                        if (existingUser) {
                            return res.status(409).send({
                                message: 'There is already a GitHub account that belongs to you'
                            });
                        }
                        var token = req.header('Authorization').split(' ')[1];
                        var payload = jwt.decode(token, config.TOKEN_SECRET);
                        Usergs.findById(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({
                                    message: 'User not found'
                                });
                            }
                            user.github.id = profile.id;
                            user.github.name = user.name || profile.name;
                            user.save(function () {
                                var token = createJWT(user);
                                res.send({
                                    token: token
                                });
                            });
                        });
                    });
                } else {
                    // Step 3b. Create a new user account or return an existing one.
                    Usergs.findOne({
                        'github.id': profile.id
                    }, function (err, existingUser) {
                        if (existingUser) {
                            var token = createJWT(existingUser);
                            return res.send({
                                token: token
                            });
                        }
                        var user = new Usergs();
                        user.github.id = profile.id;
                        user.github.name = profile.name;
                        user.save(function () {
                            var token = createJWT(user);
                            res.send({
                                token: token
                            });
                        });
                    });
                }
            });
        });

    };

}

function createJWT(user) {
    var payload = {
        sub: user._id
        , iat: moment().unix()
        , exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}
module.exports = LoginHandler;