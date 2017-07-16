var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Source.findAll().then(function (sources) {
        "use strict";
        res.send(sources);
    });

});

module.exports = router;
