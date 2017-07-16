var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.PartOfSpeech.findAll().then(function (partsOfSpeech) {
        "use strict";
        res.send(partsOfSpeech);
    });

});

module.exports = router;
