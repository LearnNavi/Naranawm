var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryBuild.findAll().then(function (builds) {
        "use strict";
        res.send(builds);
    });

});

module.exports = router;
