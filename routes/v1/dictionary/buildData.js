var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryBuildData.findAll().then(function (buildData) {
        "use strict";
        res.send(buildData);
    });

});

module.exports = router;
