var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Metadata.findAll().then(function (metadata) {
        "use strict";
        res.send(metadata);
    });

});

module.exports = router;
