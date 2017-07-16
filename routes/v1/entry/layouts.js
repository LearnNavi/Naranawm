var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryLayout.findAll().then(function (layouts) {
        "use strict";
        res.send(layouts);
    });

});

module.exports = router;
