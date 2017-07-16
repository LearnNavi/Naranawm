var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryType.findAll().then(function (types) {
        "use strict";
        res.send(types);
    });

});

module.exports = router;
