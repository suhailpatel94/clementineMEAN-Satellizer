'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Userg = new Schema({

    github: {
        id: String
        , name: String
    }

});

module.exports = mongoose.model('Userg', Userg);