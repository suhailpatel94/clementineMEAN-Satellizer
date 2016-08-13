'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var request = require('request');


var app = express();
require('dotenv').load();
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));


app.use('/public', express.static(process.cwd() + '/public'));

app.use(session({
    secret: 'secretClementine'
    , resave: false
    , saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

routes(app);

app.all('/*', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('/public/index.html', {
        root: __dirname
    });
});

var port = process.env.PORT || 8000;
app.listen(port, function () {
    console.log('Node.js listening on port ' + port + '...');
});